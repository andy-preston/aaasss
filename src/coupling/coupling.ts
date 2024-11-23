import { newContext } from "../context/context.ts";

import { newProgramMemory } from "../state/program-memory.ts";
import { newPass } from "../state/pass.ts";

import { deviceProperties } from "../device/properties.ts";
import { deviceChooser } from "../device/chooser.ts";

import { fileStack } from "../source-files/file-stack.ts";
import { javascript } from "../source-files/javascript.ts";
import { tokenise } from "../tokenise/tokenise.ts";
import { codeGenerator } from "../generate/code-generator.ts";
import { output } from "../output/output.ts";

import type { RawLine } from "./line.ts";

export const coupling = () => {
    const context = newContext();
    const properties = deviceProperties(context);
    const chooser = deviceChooser(properties, context);
    context.directive("device", chooser.directive);
    const programMemory = newProgramMemory(properties);
    context.directive("origin", programMemory.origin);
    const pass = newPass(() => {
        programMemory.reset();
    });
    const sourceFiles = fileStack();
    context.directive("include", sourceFiles.includeFile);
    const assembly = javascript(context);
    const code = codeGenerator(context, properties.public, programMemory);
    const result = output(pass);
    const pipeline = (line: RawLine) => result(code(tokenise(assembly(line))));
    return {
        "pass": pass,
        "lines": sourceFiles.lines,
        "pipeline": pipeline
    };
};
