import type { DeviceFileOperations } from "../device/file.ts";
import type { FailureMessageTranslator } from "../listing/languages.ts";
import type { FileName } from "../source-code/data-types.ts";
import type { ReaderMethod } from "../source-code/file-stack.ts";

import { dataMemory } from "../data-memory/data-memory.ts";
import { deviceChooser } from "../device/chooser.ts";
import { deviceSettings } from "../device/settings.ts";
import { directiveList } from "../directives/directive-list.ts";
import { directives } from "../directives/directives.ts";
import { functionDirectives } from "../directives/function-directives.ts";
import { hexFile } from "../hex-file/hex.ts";
import { instructionSet } from "../instruction-set/instruction-set.ts";
import { jSExpression } from "../javascript/expression.ts";
import { embeddedJs } from "../javascript/embedded.ts";
import { currentLine } from "../line/current-line.ts";
import { listing } from "../listing/listing.ts";
import { macros } from "../macros/macros.ts";
import { objectCode } from "../object-code/object-code.ts";
import { operands } from "../operands/operands.ts";
import { programMemory } from "../program-memory/program-memory.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { fileStack } from "../source-code/file-stack.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { tokens } from "../tokens/tokens.ts";
import { assemblyPipeline as thePipeline } from "./assembly-pipeline.ts";
import { outputFile } from "./output-file.ts";

export const coupling = (
    fileName: FileName,
    readerMethod: ReaderMethod,
    failureMessageTranslator: FailureMessageTranslator,
    deviceFileOperations: DeviceFileOperations
) => {
    const $currentLine = currentLine();
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $fileStack = fileStack($currentLine, readerMethod, fileName);
    const $macros = macros($currentLine, $symbolTable, $fileStack);
    const $functionDirectives = functionDirectives($currentLine);
    const $jsExpression = jSExpression($currentLine, $symbolTable);
    const $embeddedJs = embeddedJs($currentLine, $jsExpression);
    const $tokens = tokens($currentLine);
    const $instructionSet = instructionSet($currentLine, $symbolTable);
    const $programMemory = programMemory($currentLine, $symbolTable);
    const $dataMemory = dataMemory($currentLine, $symbolTable);
    const $operands = operands(
        $currentLine, $symbolTable, $cpuRegisters, $programMemory, $jsExpression
    );
    const $objectCode = objectCode(
        $currentLine, $instructionSet, $operands, $programMemory
    );
    const $deviceSettings = deviceSettings(
        $instructionSet, $cpuRegisters, $symbolTable
    );
    const $deviceChooser = deviceChooser(
        $currentLine, $deviceSettings, deviceFileOperations
    );

    const $listing = listing(
        $currentLine,
        outputFile, fileName, failureMessageTranslator, $symbolTable
    );
    const $hexFile = hexFile($currentLine, outputFile, fileName);

    const $directiveList = directiveList(
        $dataMemory, $deviceChooser, $fileStack, $functionDirectives,
        $macros, $programMemory, $symbolTable, $objectCode
    );
    directives($directiveList, $currentLine, $symbolTable);

    return thePipeline(
        $fileStack.lines,
        [
            $macros.taggedLine,
            $programMemory.lineAddress,
            $embeddedJs.pipeline,
            $tokens,
            $macros.processedLine,
            $programMemory.lineLabel,
            $objectCode.line
        ], [
            $listing, $hexFile
        ], [
            $programMemory.reset,
            $embeddedJs.reset,
            $macros.reset,
            $objectCode.reset,
            $dataMemory.reset,
            $symbolTable.reset
        ]
    );
};
