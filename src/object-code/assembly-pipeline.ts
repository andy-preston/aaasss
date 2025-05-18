import type { Pipe } from "../assembler/data-types.ts";
import type { ObjectCode } from "./object-code.ts";

export const assemblyPipeline = (
    objectCode: ObjectCode
) => {
    const assemblyPipeline = function* (lines: Pipe) {
        for (const line of lines) {
            yield objectCode.processedLine(line);
        }
    };

    return {
        "assemblyPipeline": assemblyPipeline
    };
};

export type ObjectCodePipeline = ReturnType<typeof assemblyPipeline>;
