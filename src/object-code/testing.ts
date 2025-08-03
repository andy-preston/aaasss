import { currentLine, emptyLine } from "../assembler/line.ts";
import { directives } from "../directives/directives.ts";
import { instructionSet } from "../instruction-set/instruction-set.ts";
import { jSExpression } from "../javascript/expression.ts";
import { jsFunction } from "../javascript/function.ts";
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
    const $instructionSet = instructionSet($currentLine, $symbolTable);
    const $programMemory = programMemory($currentLine, $symbolTable);
    const $jsFunction = jsFunction($currentLine, $symbolTable);
    const $jsExpression = jSExpression($jsFunction);
    const $operands = operands(
        $currentLine, $symbolTable, $cpuRegisters, $programMemory, $jsExpression
    );
    const $objectCode = objectCode(
        $currentLine, $instructionSet, $operands, $programMemory
    );
    directives({
        "assembleIf": [$objectCode.assembleIf, ["boolean"]]
    }, $currentLine, $symbolTable);
    return {
        "currentLine": $currentLine,
        "instructionSet": $instructionSet,
        "symbolTable": $symbolTable,
        "programMemory": $programMemory,
        "objectCode": $objectCode
    };
};
