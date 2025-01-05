import { deviceProperties } from "../device/properties.ts";
import { anEmptyContext } from "../javascript/context.ts";
import { lineWithRenderedJavascript } from "../javascript/embedded/line-types.ts";
import { lineWithProcessedMacro } from "../macro/line-types.ts";
import type { Code } from "../object-code/data-types.ts";
import { lineWithPokedBytes } from "../object-code/line-types.ts";
import type { NumericOperands, OperandTypes, SymbolicOperands } from "../operands/data-types.ts";
import { lineWithOperands } from "../operands/line-types.ts";
import type { Label, Mnemonic } from "../source-code/data-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";

type TestTokens = [Label, Mnemonic, SymbolicOperands]
type Test = [TestTokens, NumericOperands, OperandTypes, Code];
export type Tests = Array<Test>;

export const testEnvironment = () => {
    const context = anEmptyContext();
    return {
        "device": deviceProperties(context),
    };
};

export const testLine = (
    test: TestTokens, numeric: NumericOperands, types: OperandTypes
) => {
    const raw = lineWithRawSource("", 0, false, "");
    const rendered = lineWithRenderedJavascript(raw, "");
    const tokenised = lineWithTokens(rendered, ...test);
    const processed = lineWithProcessedMacro(tokenised, "");
    const withOperands = lineWithOperands(processed, numeric, types);
    return lineWithPokedBytes(withOperands, []);
};

export const description = (test: Test) => {
    const instruction = test[0];
    const operands = instruction[2].length == 0
        ? "; no operands"
        : instruction[2].join(", ");
    return `${instruction[1]} ${operands}`;
};
