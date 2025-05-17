import type { Pipe } from "../assembler/data-types.ts";
import type { InstructionSet } from "../device/instruction-set.ts";
import type { LineWithOperands } from "../operands/line-types.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";
import type { EncodedInstruction } from "./data-types.ts";

import { clueFailure } from "../failure/bags.ts";
import { instructionEncoderList } from "./instruction-encoder-list.ts";
import { lineWithObjectCode } from "./line-types.ts";

const addressingMode = (
    line: LineWithOperands
): EncodedInstruction | undefined => {
    for (const addressingMode of instructionEncoderList) {
        const codeGenerator = addressingMode(line)
        if (codeGenerator != undefined) {
            return codeGenerator;
        }
    }
    return undefined;
};

export const objectCode = (
    instructionSet: InstructionSet, programMemory: ProgramMemory
) => {
    const processedLine = (line: LineWithOperands) => {
        if (line.isRecordingMacro || line.mnemonic == "") {
            return lineWithObjectCode(line, undefined);
        }

        const isUnsupported = instructionSet.isUnsupported(line.mnemonic);
        if (isUnsupported.type == "failures") {
            return lineWithObjectCode(line, undefined).withFailures(
                isUnsupported.it
            );
        }

        const generatedCode = addressingMode(line);
        if (generatedCode == undefined) {
            return lineWithObjectCode(line, undefined).withFailures([
                clueFailure("mnemonic_unknown", line.mnemonic)
            ]);
        }

        return generatedCode(instructionSet, programMemory);
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
