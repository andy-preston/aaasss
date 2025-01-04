import type { Code } from "../object-code/data-types.ts";
import { lineWithProcessedMacro } from "../macro/line-types.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import {
    lineWithAddress, lineWithPokedBytes
} from "../program-memory/line-types.ts";
import type { Label, Mnemonic } from "../source-code/data-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { lineWithRenderedJavascript } from "../embedded-js/line-types.ts";

type TestTokens = [Label, Mnemonic, SymbolicOperands]
type Test = [TestTokens, Code];
export type Tests = Array<Test>;

export const testLine = (test: TestTokens) => {
    const raw = lineWithRawSource("", 0, false, "");
    const rendered = lineWithRenderedJavascript(raw, "");
    const tokenised = lineWithTokens(rendered, ...test);
    const processed = lineWithProcessedMacro(tokenised, "");
    const addressed = lineWithAddress(processed, 0);
    return lineWithPokedBytes(addressed, []);
};

export const description = (test: Test) => {
    const instruction = test[0];
    const operands = instruction[2].length == 0
        ? "; no operands"
        : instruction[2].join(", ");
    return `${instruction[1]} ${operands}`;
};
