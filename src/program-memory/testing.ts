import type { Code } from "../object-code/data-types.ts";
import type { Label } from "../tokens/data-types.ts";

import { pass } from "../assembler/pass.ts";
import { jSExpression } from "../javascript/expression.ts";
import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import { lineWithProcessedMacro } from "../macros/line-types.ts";
import { lineWithObjectCode, lineWithPokedBytes } from "../object-code/line-types.ts";
import { lineWithOperands } from "../operands/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { programMemory } from "./program-memory.ts";

export const systemUnderTest = () => {
    const $pass = pass();
    const $symbolTable = symbolTable(cpuRegisters());
    return {
        "pass": $pass,
        "symbolTable": $symbolTable,
        "programMemory": programMemory($symbolTable),
        "jsExpression": jSExpression($symbolTable)
    };
};

export const testLine = (label: Label, pokes: Array<Code>, code: Code) => {
    const $lineWithRawSource = lineWithRawSource("", 0, "", "", 0, false);
    const $lineWithRenderedJavascript = lineWithRenderedJavascript(
        $lineWithRawSource, ""
    );
    const $lineWithTokens = lineWithTokens(
        $lineWithRenderedJavascript, label, "", []
    );
    const $lineWithProcessedMacro = lineWithProcessedMacro(
        $lineWithTokens, false
    );
    const $lineWithOperands = lineWithOperands(
        $lineWithProcessedMacro, [], []
    );
    const $lineWithPokedBytes = lineWithPokedBytes(
        $lineWithOperands, pokes
    );
    return lineWithObjectCode($lineWithPokedBytes, code);
};
