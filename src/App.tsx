import React from "react";

import {customAlphabet} from "nanoid";
import {getBoolean} from "firebase/remote-config";

import {Result} from "@one-dead/game/types";
import Manager from "@one-dead/game/manager";

import {config} from "./firebase";
import AppAnalytics from "./analytics";
import Modal from "./components/completeModal";
import StartModal from "./components/startModal";


interface AppAction {
  type: "input" | "clear",
  value?: string;
}

type AppState = string;

const App = (): JSX.Element => {

  const reducer = (state: AppState, action: AppAction): AppState => {
    switch (action.type) {
      case "input":
        return addValue(action.value as string, state);
      case "clear":
        return "_ _ _ _";
      default:
        return state;
    }
  };

  const kShowHistory = getBoolean(config, "show_history");

  const [error, setError] = React.useState<Error | null>(null);
  const [started, setStarted] = React.useState<boolean>(false);
  const [timeElapsed, setTimeElapsed] = React.useState<number>(0);
  const [result, setResult] = React.useState<Result | null>(null);
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [gameName, setGameName] = React.useState<string | null>(null);
  const [shouldClear, setShouldClear] = React.useState<boolean>(false);
  const [state, dispatch] = React.useReducer<React.Reducer<AppState, AppAction>>(reducer, "_ _ _ _");

  const manager = React.useMemo(() => gameName ? new Manager(gameName) : null, [gameName]);

  React.useEffect(() => {
    if (!manager) return;

    const unSubTrial = manager.addTrialListener((result) => {
      setResult(result);
      setShouldClear(true);
    });

    const unSubTimer = manager.addTimerListener((duration) => {
      setTimeElapsed(duration);
    });

    const unSubError = manager.addErrorListener((error) => {
      setError(error);
      setShouldClear(true);
    });

    const unSubComplete = manager.addCompleteListener((history) => {
      console.log(history);
      setShowModal(true);
    });

    return () => {
      unSubError();
      unSubTimer();
      unSubTrial();
      unSubComplete();
    };
  }, [manager]);

  const formatResult = () => {
    if (!result) return "";
    if (result.deadCount == 0 && result.injuredCount == 0) {
      return "None";
    }
    const deadCount = result?.deadCount !== 0 ? `${result?.deadCount} dead` : "";
    const injuredCount = result?.injuredCount != 0 ? `${result?.injuredCount} injured` : "";

    return deadCount + "  " + injuredCount;
  };

  const playTestCode = () => {
    setError(null);
    manager?.play(state);
  };

  const enterCharacter = (char: string) => {
    if (shouldClear) {
      dispatch({type: "clear"});
      setShouldClear(false);
    }
    dispatch({type: "input", value: char});
  };

  const shareApp = () => {
    if (navigator["share"]) {
      navigator.share({
        title: "One dead game",
        text: "A strategic guessing game",
        url: "https://one-dead.web.app",
      });
    }
    AppAnalytics.share();
  };

  const computeTime = (duration: number) => {
    const seconds = (duration % 60).toString().padStart(2, "0");
    const minutes = (Math.floor(duration / 60) % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const startGame = () => {
    setGameName(generateName());
    setStarted(true);
  };

  const replayGame = () => {
    AppAnalytics.replayGame();
    window.location.reload();
  };

  return (
    <div id="app" style={{position: "fixed", height: "100%", width: "100%"}} className="flex flex-col h-full pb-3 px-2 justify-center content-center">
      <div className="flex justify-between items-center h-10">
        <div>One dead</div>
        <div className="flex gap-2">
          <div className="inline-flex justify-center py-1 px-4 rounded-md ring-gray-300 ring-1 ">
            {computeTime(timeElapsed)}
          </div>
          {kShowHistory &&
            <button
              type="button"
              className="inline-flex justify-center rounded-md px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              History
            </button>
          }
        </div>
      </div>

      <StartModal show={!started} onClickClose={startGame} />
      <Modal elapsedTime={timeElapsed} show={showModal} onClickRetry={replayGame} onClickShare={shareApp} />

      <div id="game" className="flex flex-col grow gap-4">
        <div className="border-2 border-gray-300 m-1 gap-4 rounded-md h-1/3 text-center flex flex-col justify-center content-center">
          <div className="text-8xl">{state}</div>
          <div>{error ? String(error) : formatResult()}</div>
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
          <Button onClick={() => dispatch({type: "clear"})}>Clear</Button>
          <Button onClick={() => enterCharacter("0")}>0</Button>
          <Button onClick={() => playTestCode()}>Enter</Button>
        </div>
      </div>
    </div>
  );
};


const Button = ({children, onClick}: {children: React.ReactNode, onClick?: () => void}): JSX.Element => {
  return (
    <div onClick={onClick} className="bg-gray-300 hover:bg-gray-400 ease-in transition rounded-md flex justify-center items-center text-3xl font-extrabold">
      {children}
    </div>
  );
};


const generateName = (): string => {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, 16);

  return nanoid();
};

const addValue = (input: string, value: string) => {
  if (input.length !== 1) {
    throw new Error("Input cannot be longer that one integer");
  }

  let numbers = "";
  for (const v of value) {
    if (v !== "_") {
      numbers = numbers.concat(v);
    } else {
      break;
    }
  }

  if (numbers.length !== 4) {
    numbers = numbers.concat(input);
  }

  let remainder = 4 - numbers.length;
  let spaces = remainder - 1;

  while (remainder != 0) {
    numbers = numbers.concat("_");
    if (spaces) {
      numbers = numbers.concat(" ");
      spaces--;
    }
    remainder--;
  }
  return numbers;
};



export default App;
