import * as pz from "parzec";

pz.parserDebug.debugging = false;

export enum ExpressionToken {
  Number,
  OpenParen,
  CloseParen,
  Plus,
  Minus,
  Multiply,
  Divide,
  Power,
  Whitespace,
  EOF,
}

const lexer = new pz.Lexer<ExpressionToken>(
  [
    /-?\d+(?:,\d{2,3})*(?:\.\d+)?(?:[eE][+-]?\d+)?(?:[ ]?[%|k|K|l|L])?/,
    ExpressionToken.Number,
  ],
  [/\(/, ExpressionToken.OpenParen],
  [/\)/, ExpressionToken.CloseParen],
  [/\+/, ExpressionToken.Plus],
  [/-/, ExpressionToken.Minus],
  [/(\*{2})|\^/, ExpressionToken.Power], // ** for to the power
  [/(\*{1})|x/, ExpressionToken.Multiply],
  [/\//, ExpressionToken.Divide],
  [/[\t\n\r ]+/, ExpressionToken.Whitespace]
);

// a whitespace parser
// for skipping whitespace between tokens
const optionalWhitespace = pz
  .terminal(ExpressionToken.Whitespace, "<whitespace>")
  .optionalRef();

// It's a number if followed by whitespace
const number = pz
  .terminal(ExpressionToken.Number, "<number>")
  .map((t) => {
    const numberWithoutComma: string = [...t.text].reduce(
      (acc, digit) => (digit === "," ? acc : acc + digit),
      ""
    );
    if (numberWithoutComma.toLowerCase().endsWith("%")) {
      const numberWithoutCommaWithoutScaling = numberWithoutComma.match(
        /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/
      );
      if (numberWithoutCommaWithoutScaling) {
        return Number(numberWithoutCommaWithoutScaling[0]) / 100;
      }
    }
    if (numberWithoutComma.toLowerCase().endsWith("k")) {
      const numberWithoutCommaWithoutScaling = numberWithoutComma.match(
        /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/
      );
      if (numberWithoutCommaWithoutScaling) {
        return Number(numberWithoutCommaWithoutScaling[0]) * 1000;
      }
    }
    if (numberWithoutComma.toLowerCase().endsWith("l")) {
      const numberWithoutCommaWithoutScaling = numberWithoutComma.match(
        /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/
      );
      if (numberWithoutCommaWithoutScaling) {
        return Number(numberWithoutCommaWithoutScaling[0]) * 100000;
      }
    }
    return Number(numberWithoutComma);
  })
  .followedBy(optionalWhitespace);

const openParenthesis = pz
  .terminal(ExpressionToken.OpenParen, "(")
  .followedBy(optionalWhitespace);
const closeParenthesis = pz
  .terminal(ExpressionToken.CloseParen, ")")
  .followedBy(optionalWhitespace);
const plus = pz
  .terminal(ExpressionToken.Plus, "+")
  .followedBy(optionalWhitespace);
const minus = pz
  .terminal(ExpressionToken.Minus, "-")
  .followedBy(optionalWhitespace);
const multiply = pz
  .terminal(ExpressionToken.Multiply, "*")
  .followedBy(optionalWhitespace);
const divide = pz
  .terminal(ExpressionToken.Divide, "/")
  .followedBy(optionalWhitespace);
const power = pz
  .terminal(ExpressionToken.Power, "**")
  .followedBy(optionalWhitespace);
const eof = pz.terminal(ExpressionToken.EOF, "<end of input>");

const addOperation = pz.operators(
  [plus, (a: number, b: number) => a + b],
  [minus, (a: number, b: number) => a - b]
);
const multiplyOperation = pz.operators(
  [power, (a: number, b: number) => a ** b],
  [multiply, (a: number, b: number) => a * b],
  [divide, (a: number, b: number) => a / b]
);

const term = new pz.Ref<pz.Parser<number, pz.Token<ExpressionToken>>>();
const expression = pz.forwardRef(term).chainOneOrMore(addOperation);
const factor = expression
  .bracketedBy(openParenthesis, closeParenthesis)
  .or(number);
term.target = factor.chainOneOrMore(multiplyOperation);
const rootExpression = optionalWhitespace.seq(expression).followedBy(eof);

export function evaluateExpression(expression: string): number {
  return pz.parse(
    rootExpression,
    pz.lexerInput<ExpressionToken>(
      expression,
      lexer,
      new pz.Token(ExpressionToken.EOF, "<end of input>")
    )
  );
}
