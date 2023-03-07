import React from "react";
import {GameState} from "../types";
import ChangeNotifier from "./changeNotifier";


class GameStateService extends ChangeNotifier {

  private _currentState: GameState;

  constructor(initialState = GameState.newGame) {
    super();
    this._currentState = initialState;
  }

  get currentState() {
    return this._currentState;
  }

  private checkConditions(conditions: boolean[]): boolean {
    return conditions.reduce((previous, current) => {
      if (!previous || !current) return false;
      return true;
    });
  }

  public setupGame() {
    const conditions = [
      (this._currentState < GameState.setupGame),
      (this._currentState == GameState.newGame),
    ];

    if (!this.checkConditions(conditions))
      throw new Error("Cannot make this change");
    else
      this._currentState = GameState.setupGame;
    this.notifyListeners();
  }

  public waitForReady() {
    const conditions = [
      (this._currentState < GameState.waitingForReady),
      (this._currentState == GameState.setupGame),
    ];

    if (!this.checkConditions(conditions))
      throw new Error("Cannot make this change");
    else
      this._currentState = GameState.waitingForReady;
    this.notifyListeners();
  }

  public startGame() {
    const conditions = [
      (this._currentState < GameState.started),
      (this._currentState == GameState.waitingForReady),
    ];

    if (!this.checkConditions(conditions))
      throw new Error("Cannot make this change");
    else
      this._currentState = GameState.started;
    this.notifyListeners();
  }

  public end() {
    const conditions = [
      (this._currentState < GameState.ended),
      (this._currentState == GameState.started),
    ];

    if (!this.checkConditions(conditions))
      throw new Error("Cannot make this change");
    else
      this._currentState = GameState.ended;
    this.notifyListeners();
  }

  public restartGame() {
    const conditions = [
      (this._currentState == GameState.ended),
    ];

    if (!this.checkConditions(conditions))
      throw new Error("Cannot make this change");
    else
      this._currentState = GameState.newGame;
    this.notifyListeners();
  }
}


const GameStateContext = React.createContext<GameStateService>(new GameStateService());


export const useGameState = () => {
  return React.useContext(GameStateContext);
};

interface GameStateProviderProps {
  children: React.ReactNode;
}

export const GameStateProvider = ({children}: GameStateProviderProps): JSX.Element => {
  return (
    <GameStateContext.Provider value={new GameStateService()}>
      {children}
    </GameStateContext.Provider>
  );
}

export default GameStateService;
