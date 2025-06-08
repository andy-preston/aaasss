import type { PipelineStage } from "../assembler/data-types.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import type { InstructionSet } from "../instruction-set/instruction-set.ts";
import type { CurrentLine } from "../line/current-line.ts";
import type { Line } from "../line/line-types.ts";
import type { Operands } from "../operands/operands.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";

import { emptyBag } from "../assembler/bags.ts";
import { supportFailure } from "../failure/bags.ts";
import { asWords } from "./as-words.ts";
import { encoder } from "./encoder.ts";
import { pokedBytes } from "./poked-bytes.ts";
import { ioAlternatives } from "../instruction-set/alternatives.ts";

export const objectCode = (
    instructionSet: InstructionSet, operands: Operands,
    programMemory: ProgramMemory, currentLine: CurrentLine
) => {
    let assemblyIsActivated = true;
    const encode = encoder(instructionSet, operands);

    const toLine = (line: Line, bytes: Array<number>, flipBytes: boolean) => {
        const words = asWords(bytes, line.code, flipBytes);
        const memoryEnd = programMemory.addressStep(words);
        if (memoryEnd.type == "failures") {
            line.withFailures(memoryEnd.it);
        }
    };

    const line: PipelineStage = (line: Line) => {
        if (line.lastLine) {
            assemblyIsActivated = true;
        }
        if (line.isDefiningMacro || line.mnemonic == "" || !assemblyIsActivated) {
            return;
        }
        const encoded = encode(line);

        if (encoded != undefined) {
           toLine(line, encoded, true);
        }

        for (const failure of line.failures) {
            const alternative = ioAlternatives[
                `${line.mnemonic}__${failure.kind}`
            ];
            if (alternative != undefined) {
                line.failures.push(supportFailure(
                    alternative.kind, line.mnemonic, alternative.try
                ));
            }
        }
    };

    const assembleIf = (required: boolean): DirectiveResult => {
        assemblyIsActivated = required;
        return emptyBag();
    };

    const poke = (data: Array<number | string>): DirectiveResult => {
        const line = currentLine.directiveBackdoor()!;
        toLine(line, pokedBytes(data, line.failures), false);
        return emptyBag();
    };

    return { "line": line, "poke": poke, "assembleIf": assembleIf };
};

export type ObjectCode = ReturnType<typeof objectCode>;
