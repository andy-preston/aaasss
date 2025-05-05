import type { Code } from "../object-code/data-types.ts";
import type { Label } from "../tokens/data-types.ts";

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
import { programMemoryPipeline } from "./assembly-pipeline.ts";

export const systemUnderTest = () => {
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($cpuRegisters);
    const $programMemory = programMemory($symbolTable);
    const $programMemoryPipeline = programMemoryPipeline($programMemory);
    const $jsExpression = jSExpression($symbolTable);

    return {
        "symbolTable": $symbolTable,
        "programMemory": $programMemory,
        "programMemoryPipeline": $programMemoryPipeline,
        "jsExpression": $jsExpression
    };
};

type SystemUnderTest = ReturnType<typeof systemUnderTest>;

type LineData = {"label": Label, "pokes": Array<Code>, "code": Code};

export const testPipeline = (
    system: SystemUnderTest, ...lines: Array<LineData>
) => {
    const testLines = function* () {
        for (const lineData of lines) {
            const $lineWithRawSource = lineWithRawSource("", 0, "", "", 0, false);
            const $lineWithRenderedJavascript = lineWithRenderedJavascript(
                $lineWithRawSource, ""
            );
            const $lineWithTokens = lineWithTokens(
                $lineWithRenderedJavascript, lineData.label, "", []
            );
            const $lineWithProcessedMacro = lineWithProcessedMacro(
                $lineWithTokens, false
            );
            const $lineWithOperands = lineWithOperands(
                $lineWithProcessedMacro, [], []
            );
            const $lineWithPokedBytes = lineWithPokedBytes(
                $lineWithOperands, lineData.pokes
            );
            yield lineWithObjectCode($lineWithPokedBytes, lineData.code);
        }
    };

    return system.programMemoryPipeline.assemblyPipeline(testLines());
};
