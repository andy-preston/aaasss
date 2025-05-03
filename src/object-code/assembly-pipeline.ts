import type { Pipe } from "../assembler/data-types.ts";
import type { InstructionSet } from "../device/instruction-set.ts";
import type { LineWithOperands } from "../operands/line-types.ts";
import type { EncodedInstruction } from "./data-types.ts";
import type { LineWithPokedBytes } from "./line-types.ts";
import type { PokeBuffer } from "./poke.ts";

import { clueFailure } from "../failure/bags.ts";
import { instructionEncoderList } from "./instruction-encoder-list.ts";
import { lineWithObjectCode, lineWithPokedBytes } from "./line-types.ts";

const addressingMode = (
    line: LineWithPokedBytes
): EncodedInstruction | undefined => {
    for (const addressingMode of instructionEncoderList) {
        const codeGenerator = addressingMode(line)
        if (codeGenerator != undefined) {
            return codeGenerator;
        }
    }
    return undefined;
};

const emptyLine = (line: LineWithPokedBytes) => lineWithObjectCode(line, []);

export const objectCode = (
    instructionSet: InstructionSet, pokeBuffer: PokeBuffer
) => {
    const processedLine = (line: LineWithOperands) => {
        if (line.isRecordingMacro) {
            return emptyLine(lineWithPokedBytes(line, []));
        }

        const intermediate = lineWithPokedBytes(
            line, [...pokeBuffer.contents()]
        );
        if (line.mnemonic == "") {
            return emptyLine(intermediate);
        }

        const isUnsupported = instructionSet.isUnsupported(line.mnemonic);
        if (isUnsupported.type == "failures") {
            return emptyLine(intermediate).withFailures(isUnsupported.it);
        }

        const generatedCode = addressingMode(intermediate);
        if (generatedCode == undefined) {
            return emptyLine(intermediate).withFailures([
                clueFailure("mnemonic_unknown", line.mnemonic)
            ]);
        }

        return generatedCode(instructionSet);
    };

    const assemblyPipeline = function* (lines: Pipe) {
        for (const line of lines) {
            yield processedLine(line);
        }
    };

    return {
        "assemblyPipeline": assemblyPipeline
    };
};

export type ObjectCode = ReturnType<typeof objectCode>;
