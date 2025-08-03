import { currentLine, emptyLine } from "../assembler/line.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "./symbol-table.ts";

export const testSystem = () => {
    const $currentLine = currentLine();
    $currentLine(emptyLine("plop.asm"));
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    return {
        "currentLine": $currentLine,
        "symbolTable": $symbolTable,
        "cpuRegisters": $cpuRegisters
    };
};
