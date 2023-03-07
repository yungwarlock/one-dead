import {describe, test} from "@jest/globals";
import {GameState} from "../types";

import GameStateService from "./gameState";


describe("GameState", () => {
  test("It should work", () => {
    const sut = new GameStateService(GameState.newGame);

    sut.setupGame();

    expect(sut.currentState).toBe(GameState.setupGame);

    sut.waitForReady()

    expect(sut.currentState).toBe(GameState.waitingForReady);
  });

  test("Unexpected changes in state should throw error", () => {
    const sut = new GameStateService(GameState.newGame);

    const func = () => {
      sut.end();
    }

    expect(func).toThrowError();
  });

  test("When player starts game, it should be in new game", () => {
    const sut = new GameStateService();

    expect(sut.currentState).toBe(GameState.newGame);
  });

  test("When player creates a game and finished entering code, it should be in waiting for ready", () => {
    // New game
    const sut = new GameStateService(GameState.newGame);

    // Intent to enter main code
    sut.setupGame();

    // Intent to wait for other player
    sut.waitForReady()

    expect(sut.currentState).toBe(GameState.waitingForReady);
  });


});
