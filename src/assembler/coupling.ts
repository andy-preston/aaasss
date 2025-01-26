import { dataMemory } from "../data-memory/data-memory.ts";
import { deviceChooser } from "../device/chooser.ts";
import type { DeviceFileOperations } from "../device/device-file.ts";
import { deviceProperties } from "../device/properties.ts";
import { high, low, maskToBitNumber } from "../directives/function-directives.ts";
import { illegalStateFailures } from "../failure/illegal-state.ts";
import { hexFile } from "../hex-file/hex.ts";
import { javascript } from "../javascript/embedded.ts";
import type { FailureMessageTranslator } from "../listing/messages.ts";
import { listing } from "../listing/listing.ts";
import { macros } from "../macros/macros.ts";
import { objectCode } from "../object-code/object-code.ts";
import { symbolicToNumeric } from "../operands/symbolic-to-numeric.ts";
import { programMemory } from "../program-memory/program-memory.ts";
import { pokeBuffer } from "../object-code/poke.ts";
import type { FileName } from "../source-code/data-types.ts";
import { fileStack, type ReaderMethod } from "../source-code/file-stack.ts";
import { anEmptyContext } from "../symbol-table/context.ts";
import { usageCount } from "../symbol-table/usage-count.ts";
import { tokenise } from "../tokens/tokenise.ts";
import { pass } from "./pass.ts";
import { assemblyPipeline } from "./assembler.ts";
import { outputFile } from "./output-file.ts";

export const coupling = (
    fileName: FileName,
    readerMethod: ReaderMethod,
    failureMessageTranslator: FailureMessageTranslator,
    deviceFileOperations: DeviceFileOperations
) => {
    const currentPass = pass();

    const symbols = usageCount();
    currentPass.addResetStateCallback(symbols.reset);

    const context = anEmptyContext(symbols);

    context.directive("define", context.define);

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

    const macroProcessor = macros();
    context.directive("macro", macroProcessor.macro);
    context.directive("end", macroProcessor.end);
    context.directive("useMacro", macroProcessor.useMacro);
    currentPass.addResetStateCallback(macroProcessor.reset);

    const js = javascript(context);
    currentPass.addResetStateCallback(js.reset);

    const illegalState = illegalStateFailures([
        macroProcessor.leftInIllegalState,
        js.leftInIllegalState
    ]);

    return assemblyPipeline(
        currentPass.public,
        sourceFiles.lines,
        js.rendered,
        tokenise,
        macroProcessor.lines,
        symbolicToNumeric(context),
        objectCode(properties.public, poke),
        progMem.addressed,
        listing(outputFile, fileName, failureMessageTranslator, symbols),
        hexFile(outputFile, fileName),
        illegalState
    );
};
