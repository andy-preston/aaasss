import type { FileName } from "../source-code/data-types.ts";
import type { ReaderMethod } from "../source-code/file-stack.ts";

import { currentLine } from "../line/current-line.ts";
import { emptyLine } from "../line/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { fileStack } from "../source-code/file-stack.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { macros } from "./macros.ts";

export const testSystem = (mockReader: ReaderMethod, topFileName: FileName) => {
    const $currentLine = currentLine();
    $currentLine(emptyLine(topFileName));
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $fileStack = fileStack($currentLine, mockReader, topFileName);
    const $macros = macros($currentLine, $symbolTable, $fileStack);
    return {
        "symbolTable": $symbolTable,
        "fileStack": $fileStack,
        "macros": $macros,
        "currentLine": $currentLine
    };
};
