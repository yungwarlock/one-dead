import {PredictionResult} from "./entities";

export const calculateGame = (mainCode: string, testCode: string): PredictionResult => {
  let deadCount = 0;
  let injuredCount = 0;

  for (let i = 0; i <= testCode.length - 1; i++) {
    if (mainCode[i] == testCode[i]) {
      console.log("mainCode found");
      deadCount += 1;
      continue;
    }
    for (let j = 0; j <= testCode.length - 1; j++) {
      if (mainCode[i] == testCode[j]) {
        injuredCount += 1;
        continue;
      }
    }
  }

  return {deadCount, injuredCount};
}


