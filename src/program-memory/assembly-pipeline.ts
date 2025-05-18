import type { Pipe } from "../assembler/data-types.ts";
import type { NumberDirective, StringDirective } from "../directives/bags.ts";
import type { ProgramMemory } from "./program-memory.ts";

export const programMemoryPipeline = (programMemory: ProgramMemory) => {

    const originDirective: NumberDirective = {
        "type": "numberDirective", "it": programMemory.origin
    };

    const labelDirective: StringDirective = {
        "type": "stringDirective", "it": programMemory.label
    }

    const assemblyPipeline = function* (lines: Pipe) {
        for (const line of lines) {
            yield programMemory.addressStep(line);
            programMemory.reset(line);
        }
    };

    return {
        "originDirective": originDirective,
        "labelDirective": labelDirective,
        "assemblyPipeline": assemblyPipeline
    };
};

export type ProgramMemoryPipeline = ReturnType<typeof programMemoryPipeline>;
