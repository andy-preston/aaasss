import type { Code } from "../object-code/data-types.ts";
import type { Label } from "../tokens/data-types.ts";

import { currentLine } from "../line/current-line.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { programMemoryPipeline } from "./assembly-pipeline.ts";
import { programMemory } from "./program-memory.ts";

export const systemUnderTest = () => {
    const $currentLine = currentLine();
    const line = lineWithRawSource("", 0, "", "", 0, false);
    $currentLine.forDirectives(line);
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $programMemory = programMemory($currentLine, $symbolTable);
    const $programMemoryPipeline = programMemoryPipeline($programMemory);

    return {
        "line": line,
        "symbolTable": $symbolTable,
        "programMemory": $programMemory,
        "programMemoryPipeline": $programMemoryPipeline,
    };
};

type SystemUnderTest = ReturnType<typeof systemUnderTest>;

type LineData = {"label": Label, "code": Array<Code>};

export const testPipeline = (
    system: SystemUnderTest, ...lines: Array<LineData>
) => {
    const testLines = function* () {
        for (const lineData of lines) {
            const line = lineWithRawSource("", 0, "", "", 0, false);
            lineData.code.forEach((code) => {
                line.code.push(code);
            });
            yield line;
        }
    };

    return system.programMemoryPipeline.labelPipeline(testLines());
};
