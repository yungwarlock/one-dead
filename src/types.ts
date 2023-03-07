
export type Nullable<T> = T | null;

export enum GameState {
  newGame = 0,
  setupGame = 1,
  waitingForReady = 2,
  started = 3,
  ended = 4,
}


