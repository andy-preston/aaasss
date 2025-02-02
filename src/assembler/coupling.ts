import { dataMemory } from "../data-memory/data-memory.ts";
import { deviceChooser } from "../device/chooser.ts";
import type { DeviceFileOperations } from "../device/device-file.ts";
import { deviceProperties } from "../device/properties.ts";
import { high, low } from "../directives/function-directives.ts";
import { illegalStateFailures } from "../failure/illegal-state.ts";
import { hexFile } from "../hex-file/hex.ts";
import { anEmptyContext } from "../javascript/context.ts";
import { jSExpression } from "../javascript/expression.ts";
import { embeddedJs } from "../javascript/embedded.ts";
import type { FailureMessageTranslator } from "../listing/messages.ts";
import { listing } from "../listing/listing.ts";
import { macros } from "../macros/macros.ts";
import { objectCode } from "../object-code/object-code.ts";
import { pokeBuffer } from "../object-code/poke.ts";
import { symbolicToNumeric } from "../operands/symbolic-to-numeric.ts";
import { programMemory } from "../program-memory/program-memory.ts";
import type { FileName } from "../source-code/data-types.ts";
import { fileStack, type ReaderMethod } from "../source-code/file-stack.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { tokenise } from "../tokens/tokenise.ts";
import { assemblyPipeline } from "./assembler.ts";
import { outputFile } from "./output-file.ts";
import { pass } from "./pass.ts";

export const coupling = (
    fileName: FileName,
    readerMethod: ReaderMethod,
    failureMessageTranslator: FailureMessageTranslator,
    deviceFileOperations: DeviceFileOperations
) => {
    const context = anEmptyContext();

    const currentPass = pass();

    const symbols = symbolTable(context, currentPass);
    symbols.directive("define", symbols.defineDirective);

    symbols.directive("high", high);
    symbols.directive("low", low);

    const properties = deviceProperties(symbols);
    const chooser = deviceChooser(properties, symbols, deviceFileOperations);
    symbols.directive("device", chooser.device);

    const progMem = programMemory(symbols, properties.public);
    symbols.directive("origin", progMem.origin);
    currentPass.addResetStateCallback(progMem.reset);

    const dataMem = dataMemory(properties.public);
    symbols.directive("alloc", dataMem.alloc);
    symbols.directive("allocStack", dataMem.allocStack);
    currentPass.addResetStateCallback(dataMem.reset);

    const poke = pokeBuffer();
    symbols.directive("poke", poke.poke);

    const sourceFiles = fileStack(readerMethod, fileName);
    symbols.directive("include", sourceFiles.include);

    const macroProcessor = macros(symbols);
    symbols.directive("macro", macroProcessor.macro);
    symbols.directive("end", macroProcessor.end);
    currentPass.addResetStateCallback(macroProcessor.reset);

    const expression = jSExpression(context)
    const embedded = embeddedJs(expression);
    currentPass.addResetStateCallback(embedded.reset);

    const illegalState = illegalStateFailures([
        macroProcessor.leftInIllegalState,
        embedded.leftInIllegalState
    ]);

    return assemblyPipeline(
        currentPass,
        sourceFiles.lines,
        embedded.rendered,
        tokenise,
        macroProcessor.lines,
        symbolicToNumeric(expression),
        objectCode(properties.public, poke),
        progMem.addressed,
        listing(outputFile, fileName, failureMessageTranslator, symbols),
        hexFile(outputFile, fileName),
        illegalState
    );
};
