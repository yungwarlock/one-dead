import React, {useEffect, useState} from "react";

import {GameState} from "./types";
import NewGame from "./fragments/NewGame";
import SetupGame from "./fragments/SetupGame";
import {useGameState} from "./services/gameState";
import WaitingForOpponent from "./fragments/WaitingForOpponent";

import "./App.css";

const App = (): JSX.Element => {
  const gameStateService = useGameState();

  const [state, setState] = React.useState<GameState>(GameState.setupGame);

  // useEffect(() => {
  //   const l = gameStateService.watch(() => {
  //     setState(gameStateService.currentState);
  //   })

  //   return () => {
  //     l.off();
  //   }
  // }, []);


  return (
    <div id="app-shell">

      <div id="heading">
        Heading
      </div>

      <div className="fragments-container">
        {state == GameState.newGame && <NewGame />}
        {state == GameState.setupGame && <SetupGame />}
        {state == GameState.waitingForReady && <WaitingForOpponent />}
      </div>

    </div>
  );
};
export default App;
