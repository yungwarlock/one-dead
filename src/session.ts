import {DatabaseReference, Database, ref, get, set, onValue, push} from "firebase/database";

import {Nullable} from "./types";
import {Player, Trial, SessionInfo} from "./entities";


class Session {
  private readonly channelName = "game-channel";
  private readonly dbRefPrefix: string = "session";

  public readonly sessionId: string;

  private dataChannel?: RTCDataChannel;
  private readonly rtcPeerConnection: RTCPeerConnection;

  private readonly dbRef: DatabaseReference;
  private readonly offerRef: DatabaseReference;
  private readonly answerRef: DatabaseReference;
  private readonly iceCandidateRef: DatabaseReference;

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

  private async listenForIceCandidates() {
    this.rtcPeerConnection.addEventListener("icecandidate", (e) => {
      this.currentIceCandidate = e.candidate;
      push(this.iceCandidateRef, JSON.parse(JSON.stringify(e.candidate)));
    });
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

  private async getSessionInfo(): Promise<Nullable<SessionInfo>> {
    const data = await get(this.dbRef);
    const res = data.toJSON();

    if (!res) return null;
    return this.formatSessionInfo(res);
  }

  private async setSessionOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    await set(this.offerRef, JSON.parse(JSON.stringify(offer)));
  }

  private async setSessionAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    await set(this.answerRef, JSON.parse(JSON.stringify(answer)));
  }

  private setDataChannel(channel: RTCDataChannel) {
    this.dataChannel = channel;
  }

  private createDataChannel(): RTCDataChannel {
    const dc = this.rtcPeerConnection.createDataChannel(this.channelName);
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

  public async setupConnection(): Promise<void> {
    const sessionInfo = await this.getSessionInfo();

    if (!sessionInfo || !sessionInfo.rtcInfo.offer) {
      // This is a new connection

      await this.createSession();

      // Create our data channel
      this.createDataChannel();

      // Send the session info
      // Create an offer and save it to firebase
      const offer = await this.rtcPeerConnection.createOffer();
      await this.rtcPeerConnection.setLocalDescription(offer);

      await this.setSessionOffer(offer);

      return new Promise((resolve, reject) => {
        // Wait for the remote pair to create answer
        this.listenForChanges().then(data => {

          if (!data || !data.rtcInfo.answer) return reject("No data recorded");

          // When data comes get the answer and set answer as remote description
          this.rtcPeerConnection.setRemoteDescription(data.rtcInfo.answer)
            .then(() => {
              this.rtcPeerConnection.addIceCandidate();
              // FINISHED !!!
              resolve();
            });
        });
      });

    } else {
      // Connection already been created
      // Get connection offer and create answer

      const offer = sessionInfo.rtcInfo.offer;
      await this.rtcPeerConnection.setRemoteDescription(offer);

      const answer = await this.rtcPeerConnection.createAnswer();
      await this.rtcPeerConnection.setLocalDescription(answer);

      // Send answer
      await this.setSessionAnswer(answer);

      // Get the dataChannel of the remote pair
      this.rtcPeerConnection.addIceCandidate();

      return new Promise((resolve) => {
        this.rtcPeerConnection.addEventListener("datachannel", (e) => {
          this.setDataChannel(e.channel);
          resolve();
        });
      });

    }

  }
}

export default Session;
