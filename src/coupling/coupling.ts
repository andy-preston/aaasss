import { anEmptyContext } from "../context/context.ts";
import { programMemory } from "../program-memory/program-memory.ts";
import { pokeBuffer } from "../program-memory/poke.ts";
import { pass } from "../pass/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { deviceChooser } from "../device/chooser.ts";
import { fileStack } from "../source-files/file-stack.ts";
import { javascript } from "../source-files/javascript.ts";
import { tokenise } from "../tokenise/tokenise.ts";
import { codeGenerator } from "../generate/code-generator.ts";
import { processor } from "../macro/processor.ts";
import { output } from "../output/output.ts";
import { illegalState } from "../output/illegalState.ts";
import { pipeline } from "./pipeline.ts";

export const coupling = () => {
    const context = anEmptyContext();

    const properties = deviceProperties(context);
    const chooser = deviceChooser(properties, context);
    context.directive("device", chooser.directive);

    const progMem = programMemory(context, properties);
    context.directive("origin", progMem.origin);

    const poke = pokeBuffer();
    context.directive("poke", poke.directive);

    const sourceFiles = fileStack(Deno.readTextFileSync);
    context.directive("include", sourceFiles.includeFile);

    const macroProcessor = processor();
    context.directive("macro", macroProcessor.defineDirective);
    context.directive("end", macroProcessor.endDirective);

    const js = javascript(context);

    const code = codeGenerator(context, properties.public, progMem);

    const thePass = pass([progMem.reset, js.reset]);

    const out = output(thePass);

    const illegal = illegalState(
        [macroProcessor.illegalState, js.illegalState],
        out.final
    );

    const pipe = pipeline(
        tokenise, macroProcessor, js, progMem, poke, code, out
    );

    return {
        "pass": thePass,
        "lines": sourceFiles.lines,
        "pipeline": pipe,
        "illegalState": illegal
    };
};
