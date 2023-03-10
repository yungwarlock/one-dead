import React from "react";
import {useGameState} from "../services/gameState";

import "./styles.css";

const NewGame = (): JSX.Element => {
  const gameStateService = useGameState();

  const onCreateGame = () => {
    gameStateService.waitForReady();
  }

  const onJoinGame = () => {
    gameStateService.waitForReady();
  }

  return (
    <div id="create-game" className="component">
      <button className="large" onClick={onCreateGame}>Create game</button>
      <button className="large" onClick={onJoinGame}>Join Game</button>
    </div>
  );
}


export default NewGame;
