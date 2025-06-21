import type { DeviceFileOperations } from "../device/file.ts";
import type { BaggedDirective } from "../directives/bags.ts";
import type { FailureMessageTranslator } from "../listing/languages.ts";
import type { FileName } from "../source-code/data-types.ts";
import type { ReaderMethod } from "../source-code/file-stack.ts";

import { dataMemoryCoupling } from "../data-memory/coupling.ts";
import { dataMemory } from "../data-memory/data-memory.ts";
import { deviceChooser } from "../device/chooser.ts";
import { deviceCoupling } from "../device/coupling.ts";
import { deviceSettings } from "../device/settings.ts";
import { functionDirectives } from "../directives/function-directives.ts";
import { hexFile } from "../hex-file/hex.ts";
import { instructionSet } from "../instruction-set/instruction-set.ts";
import { jSExpression } from "../javascript/expression.ts";
import { embeddedJs } from "../javascript/embedded.ts";
import { currentLine } from "../line/current-line.ts";
import { listing } from "../listing/listing.ts";
import { macroCoupling } from "../macros/coupling.ts";
import { macros } from "../macros/macros.ts";
import { objectCode } from "../object-code/object-code.ts";
import { objectCodeCoupling } from "../object-code/coupling.ts";
import { operands } from "../operands/operands.ts";
import { programMemoryCoupling } from "../program-memory/coupling.ts";
import { programMemory } from "../program-memory/program-memory.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { fileStack } from "../source-code/file-stack.ts";
import { sourceCodeCoupling } from "../source-code/coupling.ts";
import { symbolTableCoupling } from "../symbol-table/coupling.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { tokens } from "../tokens/assembly-pipeline.ts";
import { assemblyPipeline as thePipeline } from "./assembly-pipeline.ts";
import { outputFile } from "./output-file.ts";
import { directiveFunction } from "../directives/directives.ts";

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
    const $directiveFunction = directiveFunction($currentLine);
    const $jsExpression = jSExpression(
        $currentLine, $symbolTable, $directiveFunction
    );
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

    const withDirectives = <Component extends object>(component: Component) => {
        for (const property in component) {
            if (property.endsWith("Directive")) {
                const symbolName = property.replace("Directive", "");
                $symbolTable.builtInSymbol(
                    symbolName, component[property] as BaggedDirective
                );
            }
        }
        return component;
    }

    withDirectives(deviceCoupling($deviceChooser));
    withDirectives(functionDirectives($currentLine));
    const $sourceCodeCoupling = withDirectives(
        sourceCodeCoupling($fileStack)
    );
    const $programMemoryCoupling = withDirectives(
        programMemoryCoupling($programMemory)
    );
    const $macroCoupling = withDirectives(
        macroCoupling($macros)
    );
    const $objectCodeCoupling = withDirectives(
        objectCodeCoupling($objectCode)
    );
    const $dataMemoryCoupling = withDirectives(
        dataMemoryCoupling($dataMemory)
    );
    const $symbolTableCoupling = withDirectives(
        symbolTableCoupling($symbolTable)
    );

    const $listing = listing(
        $currentLine,
        outputFile, fileName, failureMessageTranslator, $symbolTable
    );
    const $hexFile = hexFile($currentLine, outputFile, fileName);

    return thePipeline(
        $sourceCodeCoupling.lines,
        [
            $macroCoupling.taggedLine,
            $programMemoryCoupling.lineAddress,
            $embeddedJs.pipeline,
            $tokens,
            $macroCoupling.processedLine,
            $programMemoryCoupling.lineLabel,
            $objectCodeCoupling.line
        ], [
            $listing, $hexFile
        ], [
            $programMemoryCoupling.reset,
            $embeddedJs.reset,
            $macroCoupling.reset,
            $objectCodeCoupling.reset,
            $dataMemoryCoupling.reset,
            $symbolTableCoupling.reset
        ]
    );
};
