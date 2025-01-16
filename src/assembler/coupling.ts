import { dataMemory } from "../data-memory/data-memory.ts";
import { deviceChooser } from "../device/chooser.ts";
import type { DeviceFileOperations } from "../device/device-file.ts";
import { deviceProperties } from "../device/properties.ts";
import { high, low, maskToBitNumber } from "../directives/function-directives.ts";
import { illegalStateFailures } from "../failure/illegal-state.ts";
import { hexFile } from "../hex-file/hex.ts";
import { anEmptyContext } from "../javascript/context.ts";
import { javascript } from "../javascript/embedded/embedded.ts";
import type { FailureMessageTranslator } from "../listing/messages.ts";
import { listing } from "../listing/listing.ts";
import { processor } from "../macro/processor.ts";
import { objectCode } from "../object-code/object-code.ts";
import { symbolicToNumeric } from "../operands/symbolic-to-numeric.ts";
import { programMemory } from "../program-memory/program-memory.ts";
import { pokeBuffer } from "../object-code/poke.ts";
import type { FileName } from "../source-code/data-types.ts";
import { fileStack, type ReaderMethod } from "../source-code/file-stack.ts";
import { tokenise } from "../tokens/tokenise.ts";
import type { OutputFile } from "./output-file.ts";
import { pass } from "./pass.ts";
import { pipeLine } from "./assembler.ts";

export const coupling = (
    fileName: FileName,
    readerMethod: ReaderMethod,
    outputFile: OutputFile,
    failureMessageTranslator: FailureMessageTranslator,
    deviceFileOperations: DeviceFileOperations
) => {
    const currentPass = pass();

    const context = anEmptyContext();

    context.directive("bit", maskToBitNumber);
    context.directive("high", high);
    context.directive("low", low);

    const properties = deviceProperties(context);
    const chooser = deviceChooser(properties, context, deviceFileOperations);
    context.directive("device", chooser.device);

    const progMem = programMemory(context, properties.public);
    context.directive("origin", progMem.origin);
    currentPass.addResetStateCallback(progMem.reset);

    const dataMem = dataMemory(properties.public);
    context.directive("alloc", dataMem.alloc);
    context.directive("allocStack", dataMem.allocStack);
    currentPass.addResetStateCallback(dataMem.reset);

    const poke = pokeBuffer();
    context.directive("poke", poke.poke);

    const sourceFiles = fileStack(readerMethod, fileName);
    context.directive("include", sourceFiles.include);

    const macroProcessor = processor();
    context.directive("define", macroProcessor.define);
    context.directive("end", macroProcessor.end);
    context.directive("macro", macroProcessor.macro);
    currentPass.addResetStateCallback(macroProcessor.reset);

    const js = javascript(context);
    currentPass.addResetStateCallback(js.reset);

    const illegalState = illegalStateFailures([
        macroProcessor.leftInIllegalState,
        js.leftInIllegalState
    ]);

    return pipeLine(
        currentPass.public,
        sourceFiles.lines,
        js.rendered,
        tokenise,
        macroProcessor.lines,
        symbolicToNumeric(context),
        objectCode(properties.public, poke),
        progMem.pipeline,
        listing(outputFile, fileName, failureMessageTranslator),
        hexFile(outputFile, fileName),
        illegalState
    );
};
