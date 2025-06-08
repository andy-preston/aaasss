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

export const coupling = (
    fileName: FileName,
    readerMethod: ReaderMethod,
    failureMessageTranslator: FailureMessageTranslator,
    deviceFileOperations: DeviceFileOperations
) => {
    const $currentLine = currentLine();
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $fileStack = fileStack(readerMethod, fileName);
    const $macros = macros($symbolTable, $fileStack);
    const $jsExpression = jSExpression($symbolTable);
    const $embeddedJs = embeddedJs($jsExpression);
    const $instructionSet = instructionSet($symbolTable);
    const $programMemory = programMemory($currentLine, $symbolTable);
    const $dataMemory = dataMemory($symbolTable);
    const $operands = operands(
        $symbolTable, $cpuRegisters, $programMemory, $jsExpression
    );
    const $objectCode = objectCode(
        $instructionSet, $operands, $programMemory, $currentLine
    );
    const $deviceSettings = deviceSettings(
        $instructionSet, $cpuRegisters, $symbolTable
    );
    const $deviceChooser = deviceChooser(
        $deviceSettings, deviceFileOperations
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
    withDirectives(functionDirectives);
    const $programMemoryCoupling = withDirectives(
        programMemoryCoupling($programMemory)
    );
    const $macroCoupling = withDirectives(
        macroCoupling($macros)
    );
    return thePipeline(
        withDirectives(sourceCodeCoupling($fileStack)).lines,
        [
            $currentLine.forDirectives,
            $macroCoupling.taggedLine,
            $programMemoryCoupling.lineAddress,
            $embeddedJs,
            tokens,
            $programMemoryCoupling.lineLabel,
            $macroCoupling.processedLine,
            withDirectives(objectCodeCoupling($objectCode)).line,
            withDirectives(dataMemoryCoupling($dataMemory)).reset,
            withDirectives(symbolTableCoupling($symbolTable)).reset
        ],
        [
            listing(outputFile, fileName, failureMessageTranslator, $symbolTable),
            hexFile(outputFile, fileName)
        ]
    );
};
