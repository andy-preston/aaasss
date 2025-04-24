import type { DeviceFileOperations } from "../device/device-file.ts";
import type { BaggedDirective } from "../directives/bags.ts";
import type { IllegalStateCallback } from "../failure/illegal-state.ts";
import type { FailureMessageTranslator } from "../listing/languages.ts";
import type { FileName } from "../source-code/data-types.ts";
import type { ReaderMethod } from "../source-code/file-stack.ts";
import type { ResetStateCallback } from "./pass.ts";

import { dataMemory } from "../data-memory/data-memory.ts";
import { deviceChooser } from "../device/chooser.ts";
import { instructionSet } from "../device/instruction-set.ts";
import { functionDirectives } from "../directives/function-directives.ts";
import { illegalStateFailures } from "../failure/illegal-state.ts";
import { hexFile } from "../hex-file/hex.ts";
import { jSExpression } from "../javascript/expression.ts";
import { embeddedJs } from "../javascript/embedded.ts";
import { listing } from "../listing/listing.ts";
import { macros } from "../macros/macros.ts";
import { objectCode } from "../object-code/assembly-pipeline.ts";
import { pokeBuffer } from "../object-code/poke.ts";
import { symbolicToNumeric } from "../operands/symbolic-to-numeric.ts";
import { programMemory } from "../program-memory/program-memory.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { fileStack } from "../source-code/file-stack.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { tokensAssemblyPipeline } from "../tokens/assembly-pipeline.ts";
import { assemblyPipeline } from "./assembly-pipeline.ts";
import { outputFile } from "./output-file.ts";
import { pass } from "./pass.ts";

export const coupling = (
    fileName: FileName,
    readerMethod: ReaderMethod,
    failureMessageTranslator: FailureMessageTranslator,
    deviceFileOperations: DeviceFileOperations
) => {

    const $pass = pass();
    const $illegalStateFailures = illegalStateFailures();
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($cpuRegisters);

    const couple = <ComponentType extends object>(component: ComponentType) => {
        if ("resetState" in component) {
            $pass.resetStateCallback(
                component.resetState as ResetStateCallback
            );
        }
        if ("leftInIllegalState" in component) {
            $illegalStateFailures.useCallback(
                component.leftInIllegalState as IllegalStateCallback
            );
        }
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

    couple($symbolTable);
    couple($cpuRegisters);

    const $fileStack = couple(fileStack(readerMethod, fileName));
    const $macros = couple(macros($symbolTable, $fileStack));

    const $jsExpression = couple(jSExpression($symbolTable));
    const $embeddedJs = couple(embeddedJs($jsExpression, $symbolTable));
    const $symbolicToNumeric = couple(symbolicToNumeric(
        $symbolTable, $cpuRegisters, $jsExpression
    ));

    const $instructionSet = couple(instructionSet($symbolTable));
    const $pokeBuffer = couple(pokeBuffer());
    const $objectCode = couple(objectCode($instructionSet, $pokeBuffer));
    const $programMemory = couple(programMemory($symbolTable));

    const $listing = couple(listing(
        outputFile, fileName, failureMessageTranslator, $symbolTable
    ));
    const $hexFile = couple(hexFile(outputFile, fileName));

    couple(functionDirectives);
    couple(dataMemory($symbolTable));
    couple(deviceChooser(
        $instructionSet, $cpuRegisters, $symbolTable, deviceFileOperations
    ));

    return assemblyPipeline(
        $pass,
        $fileStack.assemblyPipeline,
        $embeddedJs.assemblyPipeline,
        tokensAssemblyPipeline,
        $macros.assemblyPipeline,
        $symbolicToNumeric,
        $objectCode.assemblyPipeline,
        $programMemory.assemblyPipeline,
        $listing,
        $hexFile,
        $illegalStateFailures
    );
};
