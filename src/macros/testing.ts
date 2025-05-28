import type { PipelineSource } from "../assembler/data-types.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import type { FileLineIterator, FileName } from "../source-code/data-types.ts";

import { emptyBag } from "../assembler/bags.ts";
import { currentLine } from "../line/current-line.ts";
import { dummyLine, line } from "../line/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { macros } from "./macros.ts";

const mockFileStack = () => {
    let lineIterator: FileLineIterator | undefined;
    const include = (_: FileName): DirectiveResult => emptyBag();
    const pushImaginary = (iterator: FileLineIterator) => {
        lineIterator = iterator;
    };
    const lines: PipelineSource = function* () {
        if (lineIterator == undefined) {
            yield dummyLine(false, 1);
            return;
        }
        for (const [source, macroName, macroCount] of lineIterator) {
            yield line("", 0, source, macroName, macroCount, false);
        }
    };
    return {
        "include": include,
        "pushImaginary": pushImaginary,
        "lines": lines
    };
};

export const systemUnderTest = () => {
    const $currentLine = currentLine();
    const $line = dummyLine(false, 1);
    $currentLine.forDirectives($line);
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $mockFileStack = mockFileStack();
    const $macros = macros($symbolTable, $mockFileStack);
    return {
        "symbolTable": $symbolTable,
        "mockFileStack": $mockFileStack,
        "macros": $macros,
        "line": $line
    };
};
