import { newContext } from "../context/context.ts";

import { newProgramMemory } from "../program-memory/program-memory.ts";
import { pokeBuffer } from "../program-memory/poke.ts";

import { newPass } from "../pass/pass.ts";

import { deviceProperties } from "../device/properties.ts";
import { deviceChooser } from "../device/chooser.ts";

import { fileStack } from "../source-files/file-stack.ts";
import { javascript } from "../source-files/javascript.ts";

import { tokenise } from "../tokenise/tokenise.ts";

import { codeGenerator } from "../generate/code-generator.ts";

import { output } from "../output/output.ts";
import { illegalState } from "../output/illegalState.ts";

import type { RawLine } from "./line.ts";

export const coupling = () => {
    const context = newContext();

    const properties = deviceProperties(context);
    const chooser = deviceChooser(properties, context);
    context.directive("device", chooser.directive);

    const programMemory = newProgramMemory(context, properties);
    context.directive("origin", programMemory.origin);

    const poke = pokeBuffer();
    context.directive("poke", poke.directive);

    const sourceFiles = fileStack(Deno.readTextFileSync);
    context.directive("include", sourceFiles.includeFile);

    const js = javascript(context);

    const code = codeGenerator(
        context, properties.public, programMemory
    );

    const pass = newPass([programMemory.reset, js.reset]);

    const result = output(pass);

    const illegal = illegalState(
        [js.illegalState],
        result.final
    );

    const pipeline = (line: RawLine) =>
        result(code(poke.line(programMemory.label(tokenise(assembly(line))))));

    return {
        "pass": pass,
        "lines": sourceFiles.lines,
        "pipeline": pipeline,
        "illegalState": illegal
    };
};
