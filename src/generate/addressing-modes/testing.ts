import {
    addressedLine, assemblyLine, pokedLine, rawLine, tokenisedLine,
    type Code, type Label, type Mnemonic, type SymbolicOperands
} from "../../coupling/line.ts";

type TestTokens = [Label, Mnemonic, SymbolicOperands]
type Test = [TestTokens, Code];
export type Tests = Array<Test>;

export const testLine = (test: TestTokens) => {
    const raw = rawLine("", 0, "", []);
    const assembly = assemblyLine(raw, "", []);
    const tokenised = tokenisedLine(assembly, ...test, []);
    const addressed = addressedLine(tokenised, 0, []);
    return pokedLine(addressed, [], []);
};

export const description = (test: Test) => {
    const instruction = test[0];
    const operands = instruction[2].length == 0
        ? "; no operands"
        : instruction[2].join(", ");
    return `${instruction[1]} ${operands}`;
};
