import type { Pass, PipelineProcess, PipelineReset } from "../assembler/data-types.ts";
import type { CurrentLine } from "../assembler/line.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import type { InstructionSet } from "../instruction-set/instruction-set.ts";
import type { Operands } from "../operands/operands.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";

import { addFailure } from "../failure/add-failure.ts";
import { AssertionFailure, supportFailure } from "../failure/bags.ts";
import { ioAlternatives } from "../instruction-set/alternatives.ts";
import { asWords } from "./as-words.ts";
import { encoder } from "./encoder.ts";
import { pokedBytes } from "./poked-bytes.ts";

export const objectCode = (
    currentLine: CurrentLine,
    instructionSet: InstructionSet, operands: Operands,
    programMemory: ProgramMemory
) => {
    let assemblyIsActivated = true;
    const encode = encoder(instructionSet, operands);

    const toLine = (bytes: Array<number>, flipBytes: boolean) => {
        const words = asWords(bytes, currentLine().code, flipBytes);
        programMemory.addressStep(words);
    };

    const line: PipelineProcess = () => {
        const emptyLine = currentLine().mnemonic == ""
            && currentLine().operands.length == 0;
        if (emptyLine || !enabled()) {
            return;
        }

        if (currentLine().mnemonic == ".") {
            operands(["directiveDummy"]);
            return;
        }

        const encoded = encode();
        if (encoded != undefined) {
           toLine(encoded, true);
        }
        for (const failure of currentLine().failures) {
            if (failure.kind == "value_type") {
                const expected = (failure as AssertionFailure).expected;
                const alternative = ioAlternatives[
                    `${currentLine().mnemonic}__${expected}`
                ];
                if (alternative != undefined) {
                    addFailure(currentLine().failures, supportFailure(
                        alternative.kind, currentLine().mnemonic, alternative.try
                    ));
                }
            }
        }
    };

    const reset: PipelineReset = (_: Pass) => {
        assemblyIsActivated = true;
    };

    const enabled = () => assemblyIsActivated
        || looksLikeAssembleIfDirective();

    const assembleIf = (required: boolean): DirectiveResult => {
        assemblyIsActivated = required;
        return undefined;
    };

    const looksLikeAssembleIfDirective = (): boolean =>
        currentLine().mnemonic == "."
            && currentLine().operands.length == 1
            && currentLine().operands[0]!.match(/^assembleIf\(/) != null;

    const poke = (...data: Array<unknown>): DirectiveResult => {
        // we need to check `enabled` here because this directive
        // could be being issued from a JS file and the normal mechanism
        // in `line` above may not be followed
        if (enabled()) {
            toLine(pokedBytes(data, currentLine().failures), false);
        }
        return undefined;
    };

    return {
        "line": line, "reset": reset,
        "poke": poke, "assembleIf": assembleIf
    };
};

export type ObjectCode = ReturnType<typeof objectCode>;
