import type { PipelineSource } from "../assembler/data-types.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import type { FileLineIterator, FileName } from "../source-code/data-types.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import type { Label, Mnemonic } from "../tokens/data-types.ts";

import { emptyBag } from "../assembler/bags.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { macros } from "./macros.ts";
import { symbolTablePipeline } from "../symbol-table/assembly-pipeline.ts";
import { currentLine } from "../line/current-line.ts";
import { dummyLine, line } from "../line/line-types.ts";

const mockFileStack = () => {
    let lineIterator: FileLineIterator | undefined;
    const include = (_: FileName): DirectiveResult => emptyBag();
    const pushImaginary = (iterator: FileLineIterator) => {
        lineIterator = iterator;
    };
    const lines: PipelineSource = function* () {
        if (lineIterator == undefined) {
            yield dummyLine(false);
            return;
        }
        for (const [source, macroName, macroCount] of lineIterator) {
            yield line("", 0, source, macroName, macroCount, false);
        }
    };
    return {
        "include": include,
        "pushImaginary": pushImaginary,
        "lines": lines
    };
};

export const systemUnderTest = () => {
    const $currentLine = currentLine()
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $symbolTablePipeline = symbolTablePipeline($symbolTable);
    const $mockFileStack = mockFileStack();
    const $macros = macros($symbolTable, $mockFileStack);
    $macros.directiveForMacroUse({
        "type": "functionUseDirective", "it": $macros.use
    });
    return {
        "symbolTable": $symbolTable,
        "symbolTablePipeline": $symbolTablePipeline,
        "mockFileStack": $mockFileStack,
        "macros": $macros,
    };
};
