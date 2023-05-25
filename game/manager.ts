import {IHistory, Result} from "./types";
import Session from "./session";

const generateMainCode = () => {
  return "1234";
}

type Unsubscribe = () => void;


class Manager {
  private readonly session: Session;

  private completeListeners: Array<(history: IHistory) => void> = [];
  private trialListeners: Array<(result: Result) => void> = [];

  constructor(name: string) {
    const mainCode = generateMainCode();
    this.session = new Session(name, new Date(), mainCode);
  }

  public play(testCode: string) {
    const res = this.session.addTrial(testCode);

    this.dispatchTrial(res);

    if (this.session.isComplete()) {
      this.dispatchComplete();
    }
  }

  public getGameHistory() {
    return this.session.getHistory();
  }

  public addTrialListener(listener: (result: Result) => void): Unsubscribe {
    this.trialListeners.push(listener);
    return () => {
      this.trialListeners = this
        .trialListeners
        .filter((item) => item !== listener);
    }
  }

  public addCompleteListener(listener: (history: IHistory) => void): Unsubscribe {
    this.completeListeners.push(listener);
    return () => {
      this.completeListeners = this
        .completeListeners
        .filter((item) => item !== listener);
    }
  }

  private dispatchTrial(result: Result) {
    for (let listener of this.trialListeners) {
      listener(result);
    }
  }

  private dispatchComplete() {
    for (let listener of this.completeListeners) {
      listener(this.session.getHistory());
    }
  }
}


export default Manager;

