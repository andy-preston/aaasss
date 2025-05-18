import type { InstructionSet } from "../device/instruction-set.ts";
import type { ImmutableLine } from "../line/line-types.ts";
import type { LineWithOperands } from "../operands/line-types.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";
import type { Code } from "./data-types.ts";

import { clueFailure } from "../failure/bags.ts";
import { instructionEncoderList } from "./instruction-encoder-list.ts";
import { LineWithObjectCode } from "./line-types.ts";

const isTwo = (pair: Readonly<Array<number>>): pair is Code =>
    pair.length == 2;

export const objectCode = (
    instructionSet: InstructionSet, programMemory: ProgramMemory
) => {
    const addressingMode = (line: LineWithOperands) => {
        for (const addressingMode of instructionEncoderList) {
            const codeGenerator = addressingMode(line)
            if (codeGenerator != undefined) {
                return codeGenerator;
            }
        }
        return undefined;
    };

    const toLine = (line: LineWithObjectCode, bytes: Array<number>) => {
        const push = (code: Code) => {
            line.code.push(code);
            const memoryEnd = programMemory.addressPlusOne();
            if (memoryEnd.type == "failures") {
                line.withFailures(memoryEnd.it);
            }
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
    };

    const processedLine = (line: ImmutableLine): ImmutableLine => {
        if (line.isRecordingMacro || line.mnemonic == "") {
            return line;
        }

        const isUnsupported = instructionSet.isUnsupported(line.mnemonic);
        if (isUnsupported.type == "failures") {
            return line.withFailures(isUnsupported.it);
        }

        const encoder = addressingMode(line);
        if (encoder == undefined) {
            line.withFailures([clueFailure("mnemonic_unknown", line.mnemonic)]);
        } else {
            toLine(line, encoder(instructionSet, programMemory));
        }
        return line as ImmutableLine;
    };

    return {
        "toLine": toLine,
        "processedLine": processedLine
    };
};

export type ObjectCode = ReturnType<typeof objectCode>;
