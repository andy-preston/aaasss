import { instructionSet } from "../instruction-set/instruction-set.ts";
import { jSExpression } from "../javascript/expression.ts";
import { currentLine } from "../line/current-line.ts";
import { dummyLine } from "../line/line-types.ts";
import { operands } from "../operands/operands.ts";
import { programMemory } from "../program-memory/program-memory.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { objectCode } from "./object-code.ts";

export const systemUnderTest = () => {
    const $currentLine = currentLine();
    const $line = dummyLine(false, 1);
    $currentLine.forDirectives($line);
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $instructionSet = instructionSet($symbolTable);
    const $programMemory = programMemory($currentLine, $symbolTable);
    const $jsExpression = jSExpression($symbolTable);
    const $operands = operands(
        $symbolTable, $cpuRegisters, $programMemory, $jsExpression
    );
    const $objectCode = objectCode(
        $instructionSet, $operands, $programMemory, $currentLine
    );
    return {
        "line": $line,
        "instructionSet": $instructionSet,
        "symbolTable": $symbolTable,
        "programMemory": $programMemory,
        "objectCode": $objectCode
    };
};
