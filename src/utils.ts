import { Result } from "@one-dead/game/types";


export const formatResult = (result: Result) => {
  if (!result) return "";

  if (result.deadCount == 0 && result.injuredCount == 0) {
    return "None";
  }
  const deadCount = result?.deadCount !== 0 ? `${result?.deadCount} dead` : "";
  const injuredCount = result?.injuredCount != 0 ? `${result?.injuredCount} injured` : "";

  return deadCount + "  " + injuredCount;
};