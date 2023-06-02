/* eslint-disable no-constant-condition */

import Session from "./session";
import {IHistory, Result} from "./types";


const generateMainCode = () => {
  return (Math.floor(1000 + (9999 - 1000) * Math.random())).toFixed();
};


type Unsubscribe = () => void;


class Manager {
  private readonly startTime: Date;
  private readonly session: Session;

  private errorListeners: Array<(error: Error) => void> = [];
  private timerListeners: Array<(period: number) => void> = [];
  private trialListeners: Array<(result: Result) => void> = [];
  private gameTimer: ReturnType<typeof setTimeout> | null = null;
  private completeListeners: Array<(history: IHistory) => void> = [];

  constructor(name: string) {
    while (true) {
      try {
        this.startTime = new Date();
        const mainCode = generateMainCode();
        this.session = new Session(name, this.startTime, mainCode);
        this.startGameTimer();
        break;
      } catch {
        continue;
      }
    }
  }

  public play(testCode: string) {
    try {
      const res = this.session.addTrial(testCode);
      this.dispatchTrial(res);

      if (this.session.isComplete()) {
        this.stopGameTimer();
        this.dispatchComplete();
      }
    } catch (e) {
      this.dispatchError(e as Error);
    }
  }

  public getGameHistory() {
    return this.session.getHistory();
  }

  public addTimerListener(listener: (period: number) => void): Unsubscribe {
    this.timerListeners.push(listener);
    return () => {
      this.timerListeners = this
        .timerListeners
        .filter((item) => item !== listener);
    };
  }

  public addErrorListener(listener: (result: Error) => void): Unsubscribe {
    this.errorListeners.push(listener);
    return () => {
      this.errorListeners = this
        .errorListeners
        .filter((item) => item !== listener);
    };
  }

  public addTrialListener(listener: (result: Result) => void): Unsubscribe {
    this.trialListeners.push(listener);
    return () => {
      this.trialListeners = this
        .trialListeners
        .filter((item) => item !== listener);
    };
  }

  public addCompleteListener(listener: (history: IHistory) => void): Unsubscribe {
    this.completeListeners.push(listener);
    return () => {
      this.completeListeners = this
        .completeListeners
        .filter((item) => item !== listener);
    };
  }

  private startGameTimer() {
    this.gameTimer = setInterval(() => {
      const duration = Math.ceil((Date.now() - this.startTime.getTime()) / 1000);
      this.dispatchTimer(duration);
    }, 1000);
  }

  private stopGameTimer() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
  }

  private dispatchTimer(duration: number) {
    for (const listener of this.timerListeners) {
      listener(duration);
    }
  }

  private dispatchError(error: Error) {
    for (const listener of this.errorListeners) {
      listener(error);
    }
  }

  private dispatchTrial(result: Result) {
    for (const listener of this.trialListeners) {
      listener(result);
    }
  }

  private dispatchComplete() {
    for (const listener of this.completeListeners) {
      listener(this.session.getHistory());
    }
  }
}


export default Manager;
