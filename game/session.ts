import {Code, Result, Trial, IHistory} from "./types";

class Session {

  private readonly name: string;
  private readonly mainCode: Code;
  private readonly startTime: Date;
  private completed: boolean = false;
  private readonly history: Array<Trial> = [];

  constructor(name: string, startTime: Date, mainCode: Code) {
    this.name = name;
    this.mainCode = mainCode;
    this.startTime = startTime;
  }

  private calculate(mainCode: string, testCode: string): Result {
    const res: Result = {
      deadCount: 0,
      injuredCount: 0,
    };

    for (let i = 0; i <= testCode.length - 1; i++) {
      if (this.mainCode[i] == testCode[i]) {
        res.deadCount += 1;
        continue;
      }
      for (let j = 0; j <= testCode.length - 1; j++) {
        if (this.mainCode[i] == testCode[j]) {
          res.injuredCount += 1;
          continue;
        }
      }
    }

    return res;
  }


  public addTrial(testCode: Code): Result {
    const result = this.calculate(this.mainCode, testCode);

    if (result.deadCount === 4) {
      this.completed = true;
    }

    this.history.push({
      result,
      testCode,
      timestamp: Date.now(),
    })

    return result;
  }

  public isComplete(): boolean {
    return this.completed;
  }


  public getHistory(): IHistory {
    return {
      name: this.name,
      trials: this.history,
      mainCode: this.mainCode,
      startTime: this.startTime,
    }
  }

}


export default Session;

