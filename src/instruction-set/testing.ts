import { currentLine, emptyLine } from "../assembler/line.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { instructionSet } from "./instruction-set.ts";

export const testSystem = () => {
    const $currentLine = currentLine();
    $currentLine(emptyLine("plop.asm"));
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $instructionSet = instructionSet($currentLine, $symbolTable);
    return {
        "symbolTable": $symbolTable,
        "instructionSet": $instructionSet,
        "currentLine": $currentLine
    }
};
