import type { DeviceFileOperations } from "../device/device-file.ts";
import type { BaggedDirective } from "../directives/bags.ts";
import type { FailureMessageTranslator } from "../listing/languages.ts";
import type { FileName } from "../source-code/data-types.ts";
import type { ReaderMethod } from "../source-code/file-stack.ts";

import { dataMemory } from "../data-memory/data-memory.ts";
import { deviceChooser } from "../device/chooser.ts";
import { instructionSet } from "../device/instruction-set.ts";
import { functionDirectives } from "../directives/function-directives.ts";
import { hexFile } from "../hex-file/hex.ts";
import { jSExpression } from "../javascript/expression.ts";
import { assemblyPipeline as embeddedJs } from "../javascript/embedded.ts";
import { listing } from "../listing/listing.ts";
import { macros } from "../macros/macros.ts";
import { objectCode } from "../object-code/assembly-pipeline.ts";
import { pokeBuffer } from "../object-code/poke.ts";
import { symbolicToNumeric } from "../operands/assembly-pipeline.ts";
import { programMemory } from "../program-memory/program-memory.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { fileStack } from "../source-code/file-stack.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { assemblyPipeline as tokens } from "../tokens/assembly-pipeline.ts";
import { assemblyPipeline as startingWith } from "./assembly-pipeline.ts";
import { outputFile } from "./output-file.ts";

export const coupling = (
    fileName: FileName,
    readerMethod: ReaderMethod,
    failureMessageTranslator: FailureMessageTranslator,
    deviceFileOperations: DeviceFileOperations
) => {

    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($cpuRegisters);

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

    withDirectives($symbolTable);
    withDirectives($cpuRegisters);

    const $fileStack = withDirectives(fileStack(readerMethod, fileName));
    const $macros = withDirectives(macros($symbolTable, $fileStack));

    const $jsExpression = withDirectives(jSExpression($symbolTable));
    const $embeddedJs = withDirectives(embeddedJs($jsExpression, $symbolTable));
    const $symbolicToNumeric = withDirectives(symbolicToNumeric(
        $symbolTable, $cpuRegisters, $jsExpression
    ));

    const $instructionSet = withDirectives(instructionSet($symbolTable));
    const $pokeBuffer = withDirectives(pokeBuffer());
    const $objectCode = withDirectives(objectCode($instructionSet, $pokeBuffer));
    const $programMemory = withDirectives(programMemory($symbolTable));
    const $dataMemory = withDirectives(dataMemory($symbolTable));

    const $listing = withDirectives(listing(
        outputFile, fileName, failureMessageTranslator, $symbolTable
    ));
    const $hexFile = withDirectives(hexFile(outputFile, fileName));

    withDirectives(functionDirectives);
    withDirectives(dataMemory($symbolTable));
    withDirectives(deviceChooser(
        $instructionSet, $cpuRegisters, $symbolTable, deviceFileOperations
    ));

    return startingWith($fileStack.assemblyPipeline)
        .andThen($embeddedJs)
        .andThen(tokens)
        .andThen($macros.assemblyPipeline)
        /*
        .andThen($symbolicToNumeric.assemblyPipeline)
        */
        .andThen($objectCode.assemblyPipeline)
        .andThen($programMemory.assemblyPipeline)
        .andThen($dataMemory.assemblyPipeline)
        .andThen($symbolTable.assemblyPipeline)
        .results($listing, $hexFile);
};
