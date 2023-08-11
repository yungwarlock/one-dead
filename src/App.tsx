/* eslint-disable indent */

import React from "react";

import {customAlphabet} from "nanoid";

import {Result} from "@one-dead/game/types";
import Manager from "@one-dead/game/manager";

import AppAnalytics from "./analytics";
import {sessionRepository} from "./repository";
import Modal from "./components/completeModal";
import StartModal from "./components/startModal";
import PageVisibilityService from "./services/pageVisibility";
import MyModal from "./components/modalDialog";

interface AppAction {
  value?: string;
  type: "input" | "clear",
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

  //  const kShowHistory = getBoolean(config, "show_history");

  const [error, setError] = React.useState<Error | null>(null);
  const [started, setStarted] = React.useState<boolean>(false);
  const [timeElapsed, setTimeElapsed] = React.useState<number>(0);
  const [result, setResult] = React.useState<Result | null>(null);
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [gameName, setGameName] = React.useState<string | null>(null);
  const [shouldClear, setShouldClear] = React.useState<boolean>(false);
  const [showHistory, setShowHistory] = React.useState<boolean>(false);
  const [showModalDialog, setShowModalDialog] = React.useState<boolean>(false);
  const [state, dispatch] = React.useReducer<React.Reducer<AppState, AppAction>>(reducer, "_ _ _ _");

  const pageVisibility = React.useMemo(() => new PageVisibilityService(), []);
  const manager = React.useMemo(() => gameName ? new Manager(gameName) : null, [gameName]);


  React.useEffect(() => {
    if (!manager) return;

    const unSubTrial = manager.addTrialListener((result) => {
      setResult(result);
      setShouldClear(true);
    });

    const unSubPageVisibility = pageVisibility.addVisibilityChangeListener((state) => {
      if (state == "hidden") {
        manager.pauseTimer();
      } else {
        manager.resumeTimer();
      }
    });

    const unSubTimer = manager.addTimerListener((duration) => {
      setTimeElapsed(duration);
    });

    const unSubError = manager.addErrorListener((error) => {
      setError(error);
      setShouldClear(true);
    });

    const unSubComplete = manager.addCompleteListener((history) => {
      sessionRepository.sessions.add(history);
      setShowModal(true);
    });

    return () => {
      unSubError();
      unSubTimer();
      unSubTrial();
      unSubComplete();
      unSubPageVisibility();
    };
  }, [manager]);

  React.useEffect(() => {
    if (!manager) {
      const l = (e: KeyboardEvent) => {
        const val = e.key;

        const isEnter = val == "Enter";

        if (isEnter) {
          startGame();
        }
      };

      document.addEventListener("keydown", l);

      return () => {
        document.removeEventListener("keydown", l);
      };
    }

    const l = (e: KeyboardEvent) => {
      const val = e.key;

      const isEnter = val == "Enter";
      const isNumber = !Number.isNaN(Number.parseInt(val));
      const isBackSpace = val == "Backspace";
      const isHistory = val == "h" || val == "H";

      if (isEnter) {
        playTestCode(state);
      } else if (isBackSpace) {
        clear();
      } else if (isHistory) {
        setShowHistory(value => !value);
      } else if (isNumber) {
        enterCharacter(val);
      }
    };

    document.addEventListener("keydown", l);

    return () => {
      document.removeEventListener("keydown", l);
    };
  }, [manager, state, dispatch, shouldClear, showHistory, started]);

  const formatResult = (result: Result) => {
    if (!result) return "";

    if (result.deadCount == 0 && result.injuredCount == 0) {
      return "None";
    }
    const deadCount = result?.deadCount !== 0 ? `${result?.deadCount} dead` : "";
    const injuredCount = result?.injuredCount != 0 ? `${result?.injuredCount} injured` : "";

    return deadCount + "  " + injuredCount;
  };

  const playTestCode = (state: string) => {
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

  const clear = () => {
    dispatch({type: "clear"});
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

  const numOfTrials = manager?.getGameHistory().trials.length;

  const replayGame = () => {
    AppAnalytics.replayGame();
    window.location.reload();
  };

  const Game = (
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

  const History = (
    <div id="history" className="flex flex-col grow gap-4 p-8">
      <table className="table-auto">

        <thead>
          <tr>
            <th>Time</th>
            <th>Code</th>
            <th>Result</th>
          </tr>
        </thead>

        <tbody>
          {manager?.getGameHistory().trials.map((item, index) => (
            <tr key={index} className="text-center">
              <td>{item.timestamp}</td>
              <td>{item.testCode}</td>
              <td>{formatResult(item.result)}</td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );

  return (
    <div className="flex justify-center">
      <div id="app" style={{position: "fixed", height: "100%"}} className="flex flex-col h-full pb-3 px-2 justify-center content-center border-gray-300 border-x-2 w-full sm:w-8/12 md:w-6/12">
        <div className="flex justify-between items-center h-10">
          <button
            type="button"
            onClick={() => setShowModalDialog(value => !value)}
            className="inline-flex justify-center rounded-md px-3 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
          >
            <span style={{marginRight: "8px"}}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </span>

            One dead
          </button>
          <div className="flex gap-2">
            <div className="inline-flex justify-center py-1 px-3 rounded-md ring-gray-300 ring-1 ">
              {numOfTrials || 0}
            </div>
            <div className="inline-flex justify-center py-1 px-3 rounded-md ring-gray-300 ring-1 ">
              {computeTime(timeElapsed)}
            </div>

            {true &&
              <button
                type="button"
                onClick={() => setShowHistory(value => !value)}
                className="inline-flex justify-center rounded-md px-3 py-1 font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                History
              </button>
            }
          </div>
        </div>

        <StartModal show={!started} onClickClose={startGame} />
        <Modal elapsedTime={timeElapsed} show={showModal} onClickRetry={replayGame} onClickShare={shareApp} />

        {showModalDialog && <MyModal
          show={showModalDialog}
          onClickReset={replayGame}
          setShow={setShowModalDialog}
          onClickPause={() => manager?.toggleTimer()}
          onClickInstructions={() => setStarted(res => !res)}
        />}

        {showHistory && History}
        {!showHistory && Game}

      </div>
    </div>
  );
};


const Button = ({children, onClick}: {children: React.ReactNode, onClick?: () => void}): JSX.Element => {
  return (
    <div onClick={onClick} className="bg-gray-300 select-none active:bg-gray-400 ease-in transition rounded-md flex justify-center items-center text-3xl font-extrabold">
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
