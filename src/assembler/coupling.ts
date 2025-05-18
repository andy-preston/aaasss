import type { DeviceFileOperations } from "../device/file.ts";
import type { BaggedDirective } from "../directives/bags.ts";
import type { FailureMessageTranslator } from "../listing/languages.ts";
import type { FileName } from "../source-code/data-types.ts";
import type { ReaderMethod } from "../source-code/file-stack.ts";

import { dataMemory } from "../data-memory/data-memory.ts";
import { deviceDirective } from "../device/directive.ts";
import { deviceSettings } from "../device/settings.ts";
import { instructionSet } from "../device/instruction-set.ts";
import { functionDirectives } from "../directives/function-directives.ts";
import { hexFile } from "../hex-file/hex.ts";
import { jSExpression } from "../javascript/expression.ts";
import { assemblyPipeline as embeddedJs } from "../javascript/embedded.ts";
import { currentLine } from "../line/current-line.ts";
import { listing } from "../listing/listing.ts";
import { macroPipeline } from "../macros/assembly-pipeline.ts";
import { macros } from "../macros/macros.ts";
import { objectCode } from "../object-code/assembly-pipeline.ts";
import { poke } from "../object-code/poke.ts";
import { symbolicToNumeric } from "../operands/assembly-pipeline.ts";
import { programMemoryPipeline } from "../program-memory/assembly-pipeline.ts";
import { programMemory } from "../program-memory/program-memory.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { fileStack } from "../source-code/file-stack.ts";
import { symbolTablePipeline } from "../symbol-table/assembly-pipeline.ts";
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
    const $currentLine = currentLine();
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $symbolTablePipeline = symbolTablePipeline($symbolTable);

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

    const $fileStack = withDirectives(fileStack(readerMethod, fileName));
    const $macros = macros($symbolTable, $fileStack);
    const $macroPipeline = withDirectives(macroPipeline($macros));

    const $jsExpression = withDirectives(jSExpression($symbolTable));
    const $embeddedJs = withDirectives(embeddedJs($jsExpression, $currentLine));
    const $symbolicToNumeric = withDirectives(symbolicToNumeric(
        $symbolTable, $cpuRegisters, $jsExpression
    ));

    const $instructionSet = instructionSet($symbolTable);
    const $programMemory = programMemory($currentLine, $symbolTable);
    const $programMemoryPipeline = withDirectives(
        programMemoryPipeline($programMemory)
    );
    const $dataMemory = withDirectives(dataMemory($symbolTable));
    const $objectCode = withDirectives(objectCode(
        $instructionSet, $programMemory
    ));

    const $listing = listing(
        outputFile, fileName, failureMessageTranslator, $symbolTable
    );
    const $hexFile = hexFile(outputFile, fileName);

    const $deviceSettings = deviceSettings(
        $instructionSet, $cpuRegisters, $symbolTable
    );

    withDirectives($symbolTablePipeline);
    withDirectives($cpuRegisters);
    withDirectives(functionDirectives);
    withDirectives(deviceDirective($deviceSettings, deviceFileOperations));
    withDirectives(poke($currentLine));

    return startingWith($fileStack.assemblyPipeline)
        .andThen($embeddedJs)
        .andThen(tokens)
        .andThen($macroPipeline.assemblyPipeline)
        .andThen($symbolicToNumeric.assemblyPipeline)
        .andThen($objectCode.assemblyPipeline)
        .andThen($programMemoryPipeline.assemblyPipeline)
        .andThen($dataMemory.assemblyPipeline)
        .andThen($symbolTablePipeline.assemblyPipeline)
        .results($listing, $hexFile);
};
