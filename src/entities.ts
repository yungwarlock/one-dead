
export interface Player {
  name: string;
  code: string;
}

export interface Trial {
  player: string;
  code: string;
  timestamp: string;
}

export interface SessionInfo {
  sessionId: string;

  trials: Array<Trial>;
  players: Array<Player>;

  rtcInfo: {
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    iceCandidates: Array<RTCPeerConnection>;
  }
}
