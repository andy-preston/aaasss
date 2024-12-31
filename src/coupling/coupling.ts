import { anEmptyContext } from "../context/context.ts";
import { dataMemory } from "../data-memory/data-memory.ts";
import { deviceProperties } from "../device/properties.ts";
import { deviceChooser } from "../device/chooser.ts";
import { hexFile } from "../hex-file/hex.ts";
import { illegalStateFailures } from "../failure/illegal-state.ts";
import { listing } from "../listing/listing.ts";
import { processor } from "../macro/processor.ts";
import { codeGenerator } from "../object-code/code-generator.ts";
import type { FailureMessageTranslator } from "../listing/messages.ts";
import type { OutputFile } from "../pipeline/output-file.ts";
import { pass } from "../pipeline/pass.ts";
import { pipeLine } from "../pipeline/pipeline.ts";
import { programMemory } from "../program-memory/program-memory.ts";
import { pokeBuffer } from "../program-memory/poke.ts";
import type { FileName } from "../source-code/data-types.ts";
import { fileStack, type ReaderMethod } from "../source-code/file-stack.ts";
import { javascript } from "../source-code/javascript.ts";
import { tokenise } from "../tokenise/tokenise.ts";

export const coupling = (
    fileName: FileName,
    readerMethod: ReaderMethod,
    outputFile: OutputFile,
    failureMessageTranslator: FailureMessageTranslator
) => {
    const context = anEmptyContext();

    const properties = deviceProperties(context);
    const chooser = deviceChooser(properties, context);
    context.directive("device", chooser.device);

    const progMem = programMemory(context, properties.public);
    context.directive("origin", progMem.origin);

    const dataMem = dataMemory(properties.public);
    context.directive("alloc", dataMem.alloc);
    context.directive("allocStack", dataMem.allocStack);

    const poke = pokeBuffer();
    context.directive("poke", poke.poke);

    const sourceFiles = fileStack(readerMethod, fileName);
    context.directive("include", sourceFiles.include);

    const macroProcessor = processor();
    context.directive("define", macroProcessor.define);
    context.directive("end", macroProcessor.end);
    context.directive("macro", macroProcessor.macro);

    const js = javascript(context);

    const illegalState = illegalStateFailures([
        macroProcessor.leftInIllegalState,
        js.leftInIllegalState
    ]);

    return pipeLine(
        pass([
            progMem.reset, dataMem.reset, js.reset, macroProcessor.reset
        ]),
        sourceFiles.lines,
        js.rendered,
        tokenise,
        macroProcessor.lines,
        progMem.label,
        poke.line,
        codeGenerator(context, properties.public, progMem),
        listing(outputFile, fileName, failureMessageTranslator),
        hexFile(outputFile, fileName),
        illegalState
    );
};
