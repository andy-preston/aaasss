import { instructionSet } from "../device/instruction-set.ts";
import { currentLine } from "../line/current-line.ts";
import { dummyLine } from "../line/line-types.ts";
import { programMemory } from "../program-memory/program-memory.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { objectCode } from "./object-code.ts";

export const systemUnderTest = () => {
    const $currentLine = currentLine();
    const $line = dummyLine(false);
    $currentLine.forDirectives($line);
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $instructionSet = instructionSet($symbolTable);
    const $programMemory = programMemory($currentLine, $symbolTable);
    const $objectCode = objectCode($instructionSet, $programMemory, $currentLine);
    return {
        "line": $line,
        "instructionSet": $instructionSet,
        "symbolTable": $symbolTable,
        "programMemory": $programMemory,
        "objectCode": $objectCode
    };
};
