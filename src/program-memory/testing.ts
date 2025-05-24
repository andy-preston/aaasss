import { currentLine } from "../line/current-line.ts";
import { dummyLine } from "../line/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { programMemory } from "./program-memory.ts";

export const systemUnderTest = () => {
    const $currentLine = currentLine();
    const $line = dummyLine(false);
    $currentLine.forDirectives($line);
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $programMemory = programMemory($currentLine, $symbolTable);
    return {
        "currentLine": $currentLine,
        "symbolTable": $symbolTable,
        "programMemory": $programMemory,
        "line": $line
    };
};
