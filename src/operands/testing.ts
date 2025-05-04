import type { NumericOperands, OperandTypes, SymbolicOperands } from "./data-types.ts";

import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import { lineWithProcessedMacro } from "../macros/line-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { lineWithOperands } from "./line-types.ts";

export const testLine = (
    symbolicOperands: SymbolicOperands,
    numericOperands: NumericOperands,
    operandTypes: OperandTypes
) => {
    const withSource = lineWithRawSource("", 0, "", "", 0, false);
    const withJavascript = lineWithRenderedJavascript(withSource, "");
    const withTokens = lineWithTokens(withJavascript, "", "", symbolicOperands);
    const postMacro = lineWithProcessedMacro(withTokens, false);
    return lineWithOperands(postMacro, numericOperands, operandTypes);
};
