import { instructionSet } from "./instruction-set.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { currentLine } from "../line/current-line.ts";
import { dummyLine } from "../line/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";

export const testSystem = () => {
    const $currentLine = currentLine();
    const $line = dummyLine(false, 1);
    $currentLine.forDirectives($line);
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $instructionSet = instructionSet($symbolTable);
    return {
        "symbolTable": $symbolTable,
        "instructionSet": $instructionSet,
        "line": $line
    }
};
