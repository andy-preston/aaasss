import {
    addressedLine, assemblyLine, pokedLine, tokenisedLine
} from "../../line-types/lines.ts";
import { SymbolicOperands } from "../../operands/data-types.ts";
import { Label, Mnemonic } from "../../source-code/data-types.ts";
import { rawLine } from "../../source-code/raw-line.ts";
import { Code } from "../data-types.ts";

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
