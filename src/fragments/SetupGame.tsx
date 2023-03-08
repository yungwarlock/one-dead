import React from "react";

import CodeInputField from "../components/CodeInputField";
import {useGameState} from "../services/gameState";


const SetupGame = (): JSX.Element => {

  const gameStateService = useGameState();

  const [value, setValue] = React.useState<string>("");

  React.useEffect(() => {
    console.log(value);
  }, [value]);

  const onSaveCode = () => {
    gameStateService.waitForReady();
  }

  return (
    <div id="setup-game-component">

      <div className="heading-text">
        Enter your code
      </div>

      <CodeInputField onChange={(val) => setValue(val)} />

      <button className="large" onClick={onSaveCode}>Continue</button>

    </div>
  );
}


export default SetupGame;
