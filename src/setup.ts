
import Session from './session';
import {database} from './firebase';
import {PredictionResult} from './entities';

import './style.css';

const id = "dkdkdk";
const session = new Session(id, database);
await session.setupConnection();

await session.joinGame("example", "1096");

const testCode = "1234";

setInterval(async () => {
  if (!session.hasWinner) {
    let res: PredictionResult;

    if (session.myTurn) {
      console.log("My turn");
      res = await session.playPrediction(testCode);
    } else {
      console.log("Your turn");
      res = await session.awaitOpponent();
    }

    session.switchTurn();
    console.log("Current turn prediction result", res);
  } else {
    console.log("A user has won")
  }
}, 3000);

