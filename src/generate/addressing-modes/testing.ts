import {
    assemblyLine, rawLine, tokenisedLine,
    type Code, type Label, type Mnemonic, type SymbolicOperands
} from "../../coupling/line.ts";

type TestTokens = [Label, Mnemonic, SymbolicOperands]
type Test = [TestTokens, Code];
export type Tests = Array<Test>;

export const testLine = (test: TestTokens) => tokenisedLine(
    assemblyLine(
        rawLine("", 0, "", []),
        "", []
    ), ...test, []
);

export const description = (test: Test) => {
    const instruction = test[0];
    const operands = instruction[2].length == 0
        ? "; no operands"
        : instruction[2].join(", ");
    return `${instruction[1]} ${operands}`;
};
