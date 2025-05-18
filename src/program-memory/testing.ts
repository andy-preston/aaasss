import type { Label } from "../tokens/data-types.ts";

import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import { currentLine } from "../line/current-line.ts";
import { lineWithProcessedMacro } from "../macros/line-types.ts";
import { codeAsWords } from "../object-code/as-words.ts";
import { lineWithObjectCode } from "../object-code/line-types.ts";
import { lineWithOperands } from "../operands/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { programMemory } from "./program-memory.ts";
import { programMemoryPipeline } from "./assembly-pipeline.ts";

export const systemUnderTest = () => {
    const $currentLine = currentLine();
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $programMemory = programMemory($currentLine, $symbolTable);
    const $programMemoryPipeline = programMemoryPipeline($programMemory);

    return {
        "currentLine": $currentLine,
        "symbolTable": $symbolTable,
        "programMemory": $programMemory,
        "programMemoryPipeline": $programMemoryPipeline,
    };
};

type SystemUnderTest = ReturnType<typeof systemUnderTest>;

type LineData = {"label": Label, "code": Array<number>};

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
            yield lineWithObjectCode(
                $lineWithOperands, codeAsWords(lineData.code.values())
            );
        }
    };

    return system.programMemoryPipeline.assemblyPipeline(testLines());
};
