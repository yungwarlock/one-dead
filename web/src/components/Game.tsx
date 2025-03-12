import React from "react";

import Button from "./Button";
import { formatResult } from "../utils";
import { AppState, Result } from "@one-dead/game/types";

interface GameProps {
  state: AppState;
  clear: () => void;
  error: Error | null;
  result: Result | null;
  playTestCode: (state: AppState) => void;
  enterCharacter: (char: string) => void;
}


const Game = ({ error, state, result, clear, playTestCode, enterCharacter }: GameProps): JSX.Element => {

  return (
    <div id="game" className="flex flex-col grow gap-4">
      <div className="border-2 border-gray-300 m-1 gap-4 rounded-md h-1/3 text-center flex flex-col justify-center content-center">
        <div className="text-8xl">{state}</div>
        <div>{error ? String(error) : result && formatResult(result)}</div>
      </div>

      <div className="h-2/3 grid grid-cols-3 gap-4">
        <Button onClick={() => enterCharacter("1")}>1</Button>
        <Button onClick={() => enterCharacter("2")}>2</Button>
        <Button onClick={() => enterCharacter("3")}>3</Button>
        <Button onClick={() => enterCharacter("4")}>4</Button>
        <Button onClick={() => enterCharacter("5")}>5</Button>
        <Button onClick={() => enterCharacter("6")}>6</Button>
        <Button onClick={() => enterCharacter("7")}>7</Button>
        <Button onClick={() => enterCharacter("8")}>8</Button>
        <Button onClick={() => enterCharacter("9")}>9</Button>
        <Button onClick={() => clear()}>Clear</Button>
        <Button onClick={() => enterCharacter("0")}>0</Button>
        <Button onClick={() => playTestCode(state)}>Enter</Button>
      </div>
    </div>
  );
};


export default Game;