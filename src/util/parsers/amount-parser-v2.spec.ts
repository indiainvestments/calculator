import * as pz from "parzec";
import * as fc from "fast-check";
import { evaluateExpression } from "./amount-parser-v2";

test("Comma separated values", () => {
  expect(evaluateExpression("23,451,789 + 5678")).toEqual(23451789 + 5678);
});

test("Comma separated values v2", () => {
  expect(evaluateExpression("12,123 ** 3")).toEqual(12123 ** 3);
});

test("Works with k/K", () => {
  expect(evaluateExpression("1.2k + 1,35,000 + 2 ** 12 + 1.5 L")).toEqual(
    1200 + 135000 + 2 ** 12 + 1.5 * 100000
  );
});

test("Works with percentages", () => {
  expect(evaluateExpression("(1 + 3%)^12 - 1")).toEqual(1.03 ** 12 - 1);
});

test("Works with percentages V2", () => {
  expect(evaluateExpression("(2.9% x 45 / 365)")).toBeCloseTo(
    (0.029 * 45) / 365
  );
});

test("Test parsing of predefined expressions", () => {
  const testset: string[] = [
    "1 + -1",
    "2 + 3 * 3",
    "1 - 1 / 2",
    "(1 - 1) / 2",
    "(1) + (((2)) + 3)",
  ];
  for (let i = 0; i < testset.length; i++) {
    const expr = testset[i];
    const result = eval(expr);
    const calculatedResult = evaluateExpression(expr);
    expect(result).toEqual(calculatedResult);
  }
});

test("Test failing expressions", () => {
  const testset = ["1 + ", "2 ++ 3 * 3", "- 1 - 1", "", "a + 1"];
  for (let i = 0; i < testset.length; i++) {
    const expression = testset[i];
    expect(() => evaluateExpression(expression)).toThrowError(pz.ParseError);
  }
});

test.skip("Arbitrarily generated expressions", () => {
  const arbitraryNumber = fc.integer(-1000, 1000).map((n) => n.toString());
  const arbitraryOperation = fc.constantFrom("+", "-", "*", "/");
  const arbitraryExpression = fc.letrec((tie) => ({
    num: arbitraryNumber,
    operation: fc
      .tuple(
        tie("expr") as fc.Arbitrary<string>,
        arbitraryOperation,
        tie("expr") as fc.Arbitrary<string>
      )
      .map((t) => `${t[0]} ${t[1]} ${t[2]}`),
    par: tie("expr").map((e) => "(" + e + ")"),
    expr: fc.oneof(
      tie("num"),
      tie("operation"),
      tie("par")
    ) as fc.Arbitrary<string>,
  }));
  fc.assert(
    fc.property(arbitraryExpression.expr, (e) => {
      const result1 = eval(e);
      const result2 = evaluateExpression(e);
      expect(result1).toEqual(result2);
    })
  );
});
