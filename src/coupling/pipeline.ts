import { shortCutCodeLine } from "../macro/line-types.ts";
import type { MacroProcessor } from "../macro/processor.ts";
import type { CodeGenerator } from "../object-code/code-generator.ts";
import type { Output } from "../output/output.ts";
import { type Pass, passes } from "../pass/pass.ts";
import type { PokeBuffer } from "../program-memory/poke.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";
import type { FileName } from "../source-code/data-types.ts";
import type { FileStack } from "../source-code/file-stack.ts";
import type { Javascript } from "../source-code/javascript.ts";
import type { Tokenise } from "../tokenise/tokenise.ts";
import type { TokenisedLine } from "../tokenise/tokenised-line.ts";
import type { Failure } from "./value-failure.ts";

type IllegalStateCallback = () => Array<Failure>;

export const pipeLine = (
    pass: Pass,
    lines: FileStack["lines"],
    javascript: Javascript["assembly"],
    tokenise: Tokenise,
    macro: MacroProcessor["lines"],
    label: ProgramMemory["label"],
    poke: PokeBuffer["line"],
    code: CodeGenerator,
    output: Output,
    illegalStateCallbacks: Array<IllegalStateCallback>,
) => {
    const assembly = (tokenised: TokenisedLine) => {
        for (const expanded of macro(tokenised)) {
            const outputLine = expanded.macroName == ""
                ? code(poke(label(expanded)))
                : shortCutCodeLine(expanded);
            output.line(outputLine);
        }
    };

    return (fileName: FileName) => {
        for (const passNumber of passes) {
            pass.start(passNumber);
            for (const line of lines(fileName)) {
                assembly(tokenise(javascript(line)));
            }
        }
        illegalStateCallbacks.forEach(callback => output.final(callback()));
    };
};
