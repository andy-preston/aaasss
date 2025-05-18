import type { Label } from "../tokens/data-types.ts";

import { currentLine } from "../line/current-line.ts";
import { codeAsWords } from "../object-code/as-words.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
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
            yield lineWithRawSource(
                "", 0, "", "", 0, false
            ).withCode(
                codeAsWords(lineData.code.values())
            );
        }
    };

    return system.programMemoryPipeline.assemblyPipeline(testLines());
};
