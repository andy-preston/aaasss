import { anEmptyContext } from "../context/context.ts";
import { programMemory } from "../program-memory/program-memory.ts";
import { pokeBuffer } from "../program-memory/poke.ts";
import { pass } from "../pass/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { deviceChooser } from "../device/chooser.ts";
import { FileName } from "../source-code/data-types.ts";
import { fileStack } from "../source-code/file-stack.ts";
import { javascript } from "../source-code/javascript.ts";
import { tokenise } from "../tokenise/tokenise.ts";
import { codeGenerator } from "../object-code/code-generator.ts";
import { processor } from "../macro/processor.ts";
import { output } from "../output/output.ts";
import { pipeLine } from "./pipeline.ts";

export const coupling = (fileName: FileName) => {
    const context = anEmptyContext();

    const properties = deviceProperties(context);
    const chooser = deviceChooser(properties, context);
    context.directive("device", chooser.device);

    const progMem = programMemory(context, properties);
    context.directive("origin", progMem.origin);

    const poke = pokeBuffer();
    context.directive("poke", poke.poke);

    const sourceFiles = fileStack(
        Deno.readTextFileSync, fileName
    );
    context.directive("include", sourceFiles.include);

    const macroProcessor = processor();
    context.directive("define", macroProcessor.define);
    context.directive("end", macroProcessor.end);
    context.directive("macro", macroProcessor.macro);

    const js = javascript(context);

    const thePass = pass([progMem.reset, js.reset, macroProcessor.reset]);

    return pipeLine(
        thePass,
        sourceFiles.lines,
        js.rendered,
        tokenise,
        macroProcessor.lines,
        progMem.label,
        poke.line,
        codeGenerator(context, properties.public, progMem),
        output(thePass, fileName),
        [
            macroProcessor.leftInIllegalState,
            js.leftInIllegalState
        ]
    );
};
