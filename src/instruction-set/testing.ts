import { instructionSet } from "./instruction-set.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { currentLine } from "../line/current-line.ts";
import { emptyLine } from "../line/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";

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
