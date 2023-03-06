import {calculateGame, Prediction} from "./game";


describe("Game algorithm", () => {

  test("It works", () => {
    const mainCode = "1056";
    const testCode = "1234";

    const deadCount = 1;
    const injuredCount = 0;

    const res = calculateGame(mainCode, testCode);

    expect(res.deadCount).toBe(deadCount);
    expect(res.injuredCount).toBe(injuredCount);
  })

  test("It works again", () => {
    const mainCode = "2018";
    const testCode = "1234";

    const deadCount = 0;
    const injuredCount = 2;

    const res = calculateGame(mainCode, testCode);

    expect(res.deadCount).toBe(deadCount);
    expect(res.injuredCount).toBe(injuredCount);
  })

});

