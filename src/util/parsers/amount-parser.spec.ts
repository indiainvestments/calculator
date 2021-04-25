import { amountParser } from "./amount-parser";

describe("Parsing works for numeric / semi-numeric inputs", () => {
  it("parse('1234') => 1234", () => {
    expect(amountParser("1234")).toEqual({ amount: 1234 });
  });

  it("parse('12,334,142') => 12344142", () => {
    expect(amountParser("12,334,142")).toEqual({ amount: 12334142 });
  });

  it("parse('23,456,132.67') => 23456132.67", () => {
    expect(amountParser("23,456,132.67")).toEqual({ amount: 23456132.67 });
  });

  it("parse('45 K') => 45000", () => {
    expect(amountParser("45 K")).toEqual({ amount: 45000 });
  });

  it("parse('₹45 K') => 45000", () => {
    expect(amountParser("₹45 K")).toEqual({ amount: 45000 });
  });

  it("parse('4.5lac') => 450000", () => {
    expect(amountParser("4.5lac")).toEqual({ amount: 450000 });
  });

  it("parse('₹8.9L') => 890000", () => {
    expect(amountParser("₹8.9L")).toEqual({ amount: 890000 });
  });

  it("parse('1.2Cr.') => 12000000", () => {
    expect(amountParser("1.2Cr.")).toEqual({ amount: 12000000 });
  });

  it("parse('₹2.78 Crore') => 27800000", () => {
    expect(amountParser("₹2.78 Crore")).toEqual({ amount: 27800000 });
  });
});

describe("parser returns error messages for non-numeric inputs", () => {
  it("parse('+random string') => error", () => {
    expect(amountParser("+random string")).toEqual({
      errorMessage:
        "Could not parse +random string, you are supposed to put some numbers",
    });
  });

  it("parse('67fudy3sfrg') => no error", () => {
    expect(amountParser("67fudy3sfrg")).toEqual({
      amount: 673,
    });
  });

  it("parse('1.2**45') => no error", () => {
    expect(amountParser("1.2**45")).toEqual({
      amount: 1.245,
    });
  });
});
