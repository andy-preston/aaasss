import type { ImmutableLine } from "../line/line-types.ts";
import type { NumericOperands, OperandTypes, SymbolicOperands } from "../operands/data-types.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";
import type { Label, Mnemonic } from "../tokens/data-types.ts";
import type { LineWithObjectCode } from "./line-types.ts";

import { numberBag, stringBag } from "../assembler/bags.ts";
import { instructionSet } from "../device/instruction-set.ts";
import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import { lineWithProcessedMacro } from "../macros/line-types.ts";
import { lineWithOperands } from "../operands/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { objectCode } from "./assembly-pipeline.ts";
import { currentLine } from "../line/current-line.ts";

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
            const $lineWithRenderedJavascript = lineWithRenderedJavascript(
                $lineWithRawSource, ""
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

    const mockProgramMemory: ProgramMemory = {
        "address": () => 0,
        "addressStep": (line: LineWithObjectCode) => line as ImmutableLine,
        "origin": (newAddress: number) => stringBag(`${newAddress}`),
        "relativeAddress": (_address: number, _bits: number) => numberBag(0),
        "reset": (_line: LineWithObjectCode) => {},
    };

    const $currentLine = currentLine();
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $instructionSet = instructionSet($symbolTable);
    const $objectCode = objectCode($instructionSet, mockProgramMemory);
    const assemblyPipeline = $objectCode.assemblyPipeline(testLines());
    return {
        "instructionSet": $instructionSet,
        "symbolTable": $symbolTable,
        "assemblyPipeline": assemblyPipeline
    };
};
