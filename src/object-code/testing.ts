import { directiveFunction } from "../directives/directives.ts";
import { instructionSet } from "../instruction-set/instruction-set.ts";
import { jSExpression } from "../javascript/expression.ts";
import { currentLine } from "../line/current-line.ts";
import { emptyLine } from "../line/line-types.ts";
import { operands } from "../operands/operands.ts";
import { programMemory } from "../program-memory/program-memory.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { objectCode } from "./object-code.ts";

export const testSystem = () => {
    const $currentLine = currentLine();
    $currentLine(emptyLine("plop.asm"));
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $directiveFunction = directiveFunction($currentLine);
    const $instructionSet = instructionSet($currentLine, $symbolTable);
    const $programMemory = programMemory($currentLine, $symbolTable);
    const $jsExpression = jSExpression(
        $currentLine, $symbolTable, $directiveFunction);
    const $operands = operands(
        $currentLine, $symbolTable, $cpuRegisters, $programMemory, $jsExpression
    );
    const $objectCode = objectCode(
        $currentLine, $instructionSet, $operands, $programMemory
    );
    return {
        "currentLine": $currentLine,
        "instructionSet": $instructionSet,
        "symbolTable": $symbolTable,
        "programMemory": $programMemory,
        "objectCode": $objectCode
    };
};
