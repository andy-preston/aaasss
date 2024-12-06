import type { CodeGenerator } from "../generate/code-generator.ts";
import type { MacroProcessor } from "../macro/processor.ts";
import type { Output } from "../output/output.ts";
import type { PokeBuffer } from "../program-memory/poke.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";
import type { Javascript } from "../source-files/javascript.ts";
import type { Tokenise } from "../tokenise/tokenise.ts";
import { emptyCodeLine, RawLine, TokenisedLine } from "./line.ts";

export const pipeline = (
    tokenise: Tokenise,
    macroProcessor: MacroProcessor,
    javascript: Javascript,
    programMemory: ProgramMemory,
    poke: PokeBuffer,
    code: CodeGenerator,
    output: Output
) => {
    const tokenPipeline = (line: RawLine) =>
        tokenise(javascript.assembly(line));

    const assemblyPipeline = (line: TokenisedLine) =>
        output.line(code(poke.line(programMemory.label(line))));

    type ProcessFunction = (line: RawLine) => void;

    return (line: RawLine) => {
        const tokenised = tokenPipeline(line);
        if (macroProcessor.defining()) {
            macroProcessor.saveLine(tokenised);
            output.line(emptyCodeLine(tokenised, []));
        } else {
            assemblyPipeline(tokenised);
        }
    };
};
