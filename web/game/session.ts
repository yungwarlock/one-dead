import {Code, Result, Trial, IHistory} from "./types";

class Session {

  private completed = false;
  private readonly name: string;
  private readonly mainCode: Code;
  private readonly startTime: Date;
  private readonly history: Array<Trial> = [];

  constructor(name: string, startTime: Date, mainCode: Code) {
    if (this.hasRepeatingCharacters(mainCode)) {
      throw new Error(`MainCode has errors ${mainCode}`);
    }

    this.name = name;
    this.mainCode = mainCode;
    this.startTime = startTime;
  }

  private hasRepeatingCharacters(code: string): boolean {
    if (code.length <= 1) {
      return false;
    }

    const firstDigit = code.charAt(0);
    const remainingDigits = code.slice(1);

    if (remainingDigits.includes(firstDigit)) {
      return true;
    }

    return this.hasRepeatingCharacters(remainingDigits);
  }

  private hasNonNumeric(code: string): boolean {
    for (const digit of code) {
      if (Number.isNaN(Number.parseInt(digit))) {
        return true;
      }
    }
    return false;
  }

  private calculate(mainCode: string, testCode: string): Result {
    if (this.hasRepeatingCharacters(testCode)) {
      throw new Error("TestCode has repeating characters");
    }

    if (this.hasNonNumeric(testCode)) {
      throw new Error("Testcode has non numeric characters");
    }

    const res: Result = {
      deadCount: 0,
      injuredCount: 0,
    };

    for (let i = 0; i <= testCode.length - 1; i++) {
      if (mainCode[i] == testCode[i]) {
        res.deadCount += 1;
        continue;
      }
      for (let j = 0; j <= testCode.length - 1; j++) {
        if (mainCode[i] == testCode[j]) {
          res.injuredCount += 1;
          continue;
        }
      }
    }

    return res;
  }


  public addTrial(testCode: Code, timestamp: number): Result {
    const result = this.calculate(this.mainCode, testCode);

    if (result.deadCount === 4) {
      this.completed = true;
    }

    this.history.push({
      result,
      testCode,
      timestamp,
    });

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
    };
  }

}


export default Session;

