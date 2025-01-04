import type { Code } from "../object-code/data-types.ts";
import { lineWithProcessedMacro } from "../macro/line-types.ts";
import type { NumericOperands, SymbolicOperands } from "../operands/data-types.ts";
import {
    lineWithAddress, lineWithPokedBytes
} from "../program-memory/line-types.ts";
import type { Label, Mnemonic } from "../source-code/data-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { lineWithRenderedJavascript } from "../javascript/embedded/line-types.ts";
import { lineWithOperands } from "../javascript/operands/line-types.ts";

type TestTokens = [Label, Mnemonic, SymbolicOperands]
type Test = [TestTokens, NumericOperands, Code];
export type Tests = Array<Test>;

export const testLine = (test: TestTokens, numeric: NumericOperands) => {
    const raw = lineWithRawSource("", 0, false, "");
    const rendered = lineWithRenderedJavascript(raw, "");
    const tokenised = lineWithTokens(rendered, ...test);
    const processed = lineWithProcessedMacro(tokenised, "");
    const addressed = lineWithAddress(processed, 0);
    const withOperands = lineWithOperands(addressed, numeric);
    return lineWithPokedBytes(withOperands, []);
};

export const description = (test: Test) => {
    const instruction = test[0];
    const operands = instruction[2].length == 0
        ? "; no operands"
        : instruction[2].join(", ");
    return `${instruction[1]} ${operands}`;
};
