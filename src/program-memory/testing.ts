import { currentLine, emptyLine } from "../assembler/line.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { programMemory } from "./program-memory.ts";

export const testSystem = () => {
    const $currentLine = currentLine();
    $currentLine(emptyLine("plop.asm"));
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $programMemory = programMemory($currentLine, $symbolTable);
    return {
        "currentLine": $currentLine,
        "symbolTable": $symbolTable,
        "programMemory": $programMemory
    };
};
