import type { NumericOperands, OperandTypes, SymbolicOperands } from "../operands/data-types.ts";
import type { Label, Mnemonic } from "../tokens/data-types.ts";

import { instructionSet } from "../device/instruction-set.ts";
import { directiveFunction } from "../directives/directive-function.ts";
import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import { currentLine } from "../line/current-line.ts";
import { lineWithProcessedMacro } from "../macros/line-types.ts";
import { lineWithOperands } from "../operands/line-types.ts";
import { programMemory } from "../program-memory/program-memory.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { assemblyPipeline } from "./assembly-pipeline.ts";
import { objectCode } from "./object-code.ts";
import { poke } from "./poke.ts";
import { lineWithAddress } from "../program-memory/line-types.ts";

type LineData = {
    "label": Label, "mnemonic": Mnemonic,
    "symbolicOperands": SymbolicOperands, "numericOperands": NumericOperands,
    "operandTypes": OperandTypes, "isRecordingMacro": boolean
};

export const systemUnderTest = (...lines: Array<LineData>) => {
    const testLines = function* () {
        for (const lineData of lines) {
            const $lineWithRawSource = lineWithRawSource(
                "", 0, "", "", 0, false
            );
            const $lineWithAddress = lineWithAddress(
                $lineWithRawSource, 0
            )
            const $lineWithRenderedJavascript = lineWithRenderedJavascript(
                $lineWithAddress, ""
            );
            const $lineWithTokens = lineWithTokens(
                $lineWithRenderedJavascript,
                lineData.label, lineData.mnemonic, lineData.symbolicOperands
            );
            const $lineWithProcessedMacro = lineWithProcessedMacro(
                $lineWithTokens, lineData.isRecordingMacro
            );
            yield lineWithOperands(
                $lineWithProcessedMacro,
                lineData.numericOperands, lineData.operandTypes
            );
        }
    };

    const $currentLine = currentLine();
    const line = lineWithRawSource("", 0, "", "", 0, false);
    $currentLine.forDirectives(line);
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $instructionSet = instructionSet($symbolTable);
    const $programMemory = programMemory($currentLine, $symbolTable);
    const $objectCode = objectCode($instructionSet, $programMemory);
    const $assemblyPipeline = assemblyPipeline($objectCode);
    const $poke = poke($currentLine, $objectCode);
    return {
        "line": line,
        "instructionSet": $instructionSet,
        "symbolTable": $symbolTable,
        "poke": directiveFunction("poke", $poke.pokeDirective),
        "assemblyPipeline": $assemblyPipeline.assemblyPipeline(testLines())
    };
};
