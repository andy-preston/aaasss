import type { PipelineStage } from "../assembler/data-types.ts";
import type { InstructionSet } from "../device/instruction-set.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import type { CurrentLine } from "../line/current-line.ts";
import type { Line } from "../line/line-types.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";
import type { Code } from "./data-types.ts";

import { emptyBag } from "../assembler/bags.ts";
import { clueFailure, numericTypeFailure } from "../failure/bags.ts";
import { encoderFor } from "./instruction-encoder-list.ts";

const isTwo = (pair: Readonly<Array<number>>): pair is Code => pair.length == 2;

const textEncoder = new TextEncoder();

export const objectCode = (
    instructionSet: InstructionSet, programMemory: ProgramMemory,
    currentLine: CurrentLine
) => {
    const toLine = (line: Line, bytes: Array<number>) => {
        let words = 0;

        const push = (code: Code) => {
            line.code.push(code);
            words = words + 1;
        };

        let pair: Array<number> = [];
        bytes.forEach((byte) => {
            pair.push(byte);
            if (isTwo(pair)) {
                push(pair);
                pair = [];
            }
        });
        if (pair.length == 1) {
            push([pair[0]!, 0]);
        }
        const memoryEnd = programMemory.addressStep(words);
        if (memoryEnd.type == "failures") {
            line.withFailures(memoryEnd.it);
        }
    };

    const line: PipelineStage = (line: Line) => {
        if (line.isDefiningMacro || line.mnemonic == "") {
            return;
        }

        const isUnsupported = instructionSet.isUnsupported(line.mnemonic);
        if (isUnsupported.type == "failures") {
            line.withFailures(isUnsupported.it);
            return;
        }

        const encoder = encoderFor(line);
        if (encoder == undefined) {
            line.withFailures([clueFailure("mnemonic_unknown", line.mnemonic)]);
            return
        };

        toLine(line, encoder(instructionSet, programMemory));
    };

    const poke = (data: Array<number | string>): DirectiveResult => {
        const line = currentLine.directiveBackdoor()!;

        const bytes = data.flatMap(
            (item, index) => {
                if (typeof item == "string") {
                    return Array.from(textEncoder.encode(item));
                }

                if (item < 0 || item > 0xff) {
                    const failure = numericTypeFailure(
                        "type_bytesOrString", item, 0, 0xff, []
                    );
                    failure.location = {"parameter": index};
                    line.failures.push(failure);
                    return [];
                }

                return item;
            }
        );

        toLine(line, bytes);
        return emptyBag();
    };

    return { "line": line, "poke": poke };
};

export type ObjectCode = ReturnType<typeof objectCode>;
