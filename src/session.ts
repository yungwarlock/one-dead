import {DatabaseReference, Database, ref, get, set, onValue, push} from "firebase/database";

import {Nullable} from "./types";
import {calculateGame} from "./game";
import {Player, SessionInfo, PredictionResult} from "./entities";


type MessageType = "ready" | "prediction" | "prediction-result";
interface Message {
  type: MessageType;
  data: Record<string, string | number>;
}


class Queue<T> {
  private readonly pollInterval = 200;
  private readonly data: Array<T> = [];

  public push(data: T) {
    console.log("Pushed....");
    console.log(this.data);
    this.data.push(data);
  }

  public async pop(): Promise<T> {
    if (this.data.length == 0) {

      return new Promise(resolve => {
        const res = setInterval(() => {
          if (this.data.length > 0) {
            clearInterval(res);
            resolve(this.data.pop() as T);
          }
        }, this.pollInterval);

      });
    } else {
      return Promise.resolve(this.data.pop()) as T;
    }
  }
}


class Session {
  // Data channel name
  // This is the channel that we will be communicating with
  // It's just like a websocket channel
  private readonly channelId = "game-channel";

  // Top level path that all session info will be stored
  private readonly dbRefPrefix: string = "session";

  // The current session id
  public readonly sessionId: string;

  private dataChannel?: RTCDataChannel;

  // The WebRTC connection we use to communicate with
  private readonly rtcPeerConnection: RTCPeerConnection;

  // Database references
  private readonly dbRef: DatabaseReference;
  private readonly offerRef: DatabaseReference;
  private readonly answerRef: DatabaseReference;
  private readonly iceCandidateRef: DatabaseReference;

  public hasWinner = false;
  public myTurn: boolean = false;
  private currentPlayer: Nullable<Player> = null;
  private readonly messageQueue = new Queue<Message>();

  // Our ICE candidate descriptor
  private currentIceCandidate: Nullable<RTCIceCandidate> = null;

  constructor(sessionId: string, database: Database) {
    this.sessionId = sessionId;
    this.rtcPeerConnection = new RTCPeerConnection();
    this.dbRef = ref(database, `${this.dbRefPrefix}/${sessionId}`);
    this.offerRef = ref(database, `${this.dbRefPrefix}/${sessionId}/rtcInfo/offer`);
    this.answerRef = ref(database, `${this.dbRefPrefix}/${sessionId}/rtcInfo/answer`);
    this.iceCandidateRef = ref(database, `${this.dbRefPrefix}/${sessionId}/rtcInfo/iceCandidates`);

    this.listenForIceCandidates();
  }

  private async finalizeSetup() {
    const dataChannel = this.getDataChannel();

    dataChannel?.addEventListener("message", (e) => {
      this.messageQueue.push(JSON.parse(e.data) as Message);
    });
  }

  /**
   * Add your name and main code to game then announce
   * that you're ready
   */
  public async joinGame(name: string, code: string): Promise<void> {
    const dataChannel = this.getDataChannel();
    if (!dataChannel) throw new Error("No datachannel");

    this.currentPlayer = {name, code}

    const message: Message = {
      type: "ready",
      data: {}
    };

    dataChannel.send(JSON.stringify(message));

    // Wait for opponent to be ready
    await this.listenForMessage("ready");
  }

  public switchTurn() {
    this.myTurn = !this.myTurn;
  }


  /**
   * Play a prediction on the opponent
   */
  public async playPrediction(code: string): Promise<PredictionResult> {
    const dataChannel = this.getDataChannel();

    const message: Message = {
      type: "prediction",
      data: {code}
    }

    dataChannel?.send(JSON.stringify(message));

    const res = await this.listenForMessage("prediction-result");
    return res.data as PredictionResult;
  }

  public async awaitOpponent(): Promise<PredictionResult> {
    const message = await this.listenForMessage("prediction");

    const mainCode = this.currentPlayer!.code;
    const testCode = message.data.code as string;

    console.log(message);
    console.log(mainCode, testCode);

    const res = calculateGame(mainCode, testCode);
    return res;
  }

  private async listenForMessage(type: MessageType): Promise<Message> {
    while (true) {
      console.log("New message");
      const res = await this.messageQueue.pop();
      if (res.type != type) {
        this.messageQueue.push(res);
        console.log("Putting back");
      }
      return res;
    }
  }

  /**
   * Setup a WebRTC connection with the current players
   */
  public async setupConnection(): Promise<void> {
    const sessionInfo = await this.getSessionInfo();

    if (!sessionInfo || !sessionInfo.rtcInfo.offer) {
      // This is a new connection
      await this.createSession();

      // Create a data channel for the game
      this.createDataChannel();

      // Send the session info
      // Create an offer and save it to firebase
      const offer = await this.rtcPeerConnection.createOffer();
      await this.rtcPeerConnection.setLocalDescription(offer);

      // Set my offer
      await this.setSessionOffer(offer);

      return new Promise((resolve, reject) => {
        // Wait for the opponent to create an answer
        this.listenForChanges().then(data => {
          if (!data || !data.rtcInfo.answer) return reject("No data recorded");

          // When data comes get the answer and set answer as remote description
          this.rtcPeerConnection.setRemoteDescription(data.rtcInfo.answer)
            .then(() => {
              this.dataChannel?.addEventListener("open", () => {
                // FINISHED !!!

                // First player
                this.myTurn = true;

                this.finalizeSetup();
                resolve();
              });

            });
        });
      });

    } else {
      // Connection already been created
      // So we get the connection's offer and create an answer

      const offer = sessionInfo.rtcInfo.offer;
      await this.rtcPeerConnection.setRemoteDescription(offer);

      const answer = await this.rtcPeerConnection.createAnswer();
      await this.rtcPeerConnection.setLocalDescription(answer);

      // Set my answer
      await this.setSessionAnswer(answer);

      return new Promise((resolve) => {
        // Wait for when a datachannel has been created and set as my datachannel
        this.rtcPeerConnection.addEventListener("datachannel", (e) => {
          // FINISHED !!!
          this.setDataChannel(e.channel);

          e.channel.addEventListener("open", () => {
            console.log("Opeened");
            this.finalizeSetup();
            // First player
            this.myTurn = false;
            resolve();

          });

        });
      });
    }
  }

  /**
   * Synchronize all iceCandidates created within the current
   * WebRTC session
   */
  private async listenForIceCandidates() {
    this.rtcPeerConnection.addEventListener("icecandidate", (e) => {
      this.currentIceCandidate = e.candidate;
      push(this.iceCandidateRef, JSON.parse(JSON.stringify(e.candidate)));
    });

    // Listen for changes to the iceCandidateRef and synchronize
    onValue(this.iceCandidateRef, async (snapshot) => {
      const res = snapshot.toJSON() as Nullable<Array<RTCIceCandidate>>;
      if (!res) return;

      for (let candidate of Object.values(res)) {
        if (candidate?.candidate !== this.currentIceCandidate?.candidate) {
          if (!this.rtcPeerConnection.remoteDescription) return;
          this.rtcPeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }
    });
  }

  /**
   * Pull current session info from firebase
   */
  private async getSessionInfo(): Promise<Nullable<SessionInfo>> {
    const data = await get(this.dbRef);
    const res = data.toJSON();

    if (!res) return null;
    return this.formatSessionInfo(res);
  }

  /**
   * Save an offer created within the current session
   */
  private async setSessionOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    await set(this.offerRef, JSON.parse(JSON.stringify(offer)));
  }

  /**
   * Save an answer created within the current session
   */
  private async setSessionAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    await set(this.answerRef, JSON.parse(JSON.stringify(answer)));
  }

  private setDataChannel(channel: RTCDataChannel) {
    this.dataChannel = channel;
  }

  private createDataChannel(): RTCDataChannel {
    const dc = this.rtcPeerConnection.createDataChannel(this.channelId);
    this.dataChannel = dc;
    return dc;
  }

  private getDataChannel(): Nullable<RTCDataChannel> {
    if (!this.dataChannel) return null;
    return this.dataChannel;
  }

  private formatSessionInfo(data: Record<string, any>): SessionInfo {
    return {
      sessionId: this.sessionId,

      trials: data.trials || [],

      players: data.players ? data.players.map((item: Record<string, string>) => ({
        name: item.name,
        code: item.code,
      } as Player)) : [],

      rtcInfo: data.rtcInfo,

    } as SessionInfo;
  }

  private listenForChanges(): Promise<Nullable<SessionInfo>> {
    return new Promise((resolve) => {
      let firstTrigger = false;
      onValue(this.dbRef, (snapshot) => {
        if (!firstTrigger) {
          firstTrigger = true;
          return;
        }

        const res = snapshot.toJSON();
        if (!res)
          resolve(null);
        else
          resolve(this.formatSessionInfo(res));
      })
    })
  }

  private async createSession() {
    await set(this.dbRef, {});
  }

}

export default Session;
