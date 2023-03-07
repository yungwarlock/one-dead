import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";


const rootDiv = document.querySelector("#app") as HTMLDivElement;
const root = ReactDOM.createRoot(rootDiv);

root.render(<App />);
