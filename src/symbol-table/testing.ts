import { currentLine } from "../line/current-line.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "./symbol-table.ts";

export const testSystem = () => {
    const $currentLine = currentLine();
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    return {
        "symbolTable": $symbolTable,
        "cpuRegisters": $cpuRegisters,
    };
};
