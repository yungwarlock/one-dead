import React from "react";
import ReactDOM from "react-dom/client";

import "./style.css";
import App from "./App";
import {GameStateProvider} from "./services/gameState";

const Main = (): JSX.Element => {
  return (
    <GameStateProvider>
      <App />
    </GameStateProvider>
  );
}


const rootDiv = document.querySelector("#app") as HTMLDivElement;
const root = ReactDOM.createRoot(rootDiv);

root.render(<App />);
