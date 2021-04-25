const ignoredCharacters: string[] = [",", " "];

interface ParsedAmountOutputSuccess {
  amount: number;
}

interface ParsedAmountOutputFail {
  errorMessage: string;
}

type ParsedAmountOutput = ParsedAmountOutputFail | ParsedAmountOutputSuccess;

export function amountParser(input?: string): ParsedAmountOutput {
  if (!input || input.length === 0) {
    return {
      errorMessage: `Could not parse ${input}, you are supposed to add an input`,
    };
  }

  // extract the numbers
  // ₹11,568,345 INR => 11568345
  const regExForNumericGroups = /[\d]+/g;
  const result = Array.from(input.matchAll(regExForNumericGroups));

  if (result.length === 0) {
    return {
      errorMessage: `Could not parse ${input}, you are supposed to put some numbers`,
    };
  }

  const stringNumber: string = result.reduce((acc: string, match) => {
    if (
      match["input"] &&
      match["index"] &&
      match["input"][match["index"] - 1] === "."
    ) {
      return `${acc}.${match[0]}`;
    }
    return `${acc}${match[0]}`;
  }, "");

  let numericInput: number;

  try {
    numericInput = Number.parseFloat(stringNumber);
  } catch (ex) {
    return {
      errorMessage: `Could not parse ${input}, you are supposed to put some numbers`,
    };
  }

  if (Number.isNaN(numericInput)) {
    return {
      errorMessage: `Could not parse ${input}, you are supposed to put some numbers`,
    };
  }

  // handle multipliers like K, L(acs), Cr(.) etc.
  const lastNumericMatch = result[result.length - 1];
  let stringAfterNumbersEnd = "";
  if (lastNumericMatch["input"] && lastNumericMatch["index"] !== undefined) {
    stringAfterNumbersEnd = lastNumericMatch["input"]?.slice(
      lastNumericMatch[0].length + lastNumericMatch["index"]
    );
    stringAfterNumbersEnd = stringAfterNumbersEnd.trim();
  }

  if (stringAfterNumbersEnd.charAt(0).toLowerCase() === "k") {
    return {
      amount: numericInput * 1000,
    };
  }

  if (stringAfterNumbersEnd.charAt(0).toLowerCase() === "l") {
    return {
      amount: numericInput * 1000 * 100,
    };
  }

  if (
    stringAfterNumbersEnd.charAt(0).toLowerCase() === "c" &&
    stringAfterNumbersEnd.charAt(1).toLowerCase() === "r"
  ) {
    return {
      amount: numericInput * 1000 * 100 * 100,
    };
  }
  return {
    amount: numericInput,
  };
}
