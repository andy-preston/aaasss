import type { Pipe } from "../assembler/data-types.ts";
import type { NumberDirective } from "../directives/bags.ts";
import type { ProgramMemory } from "./program-memory.ts";

export const programMemoryPipeline = (programMemory: ProgramMemory) => {

    const originDirective: NumberDirective = {
        "type": "numberDirective", "it": programMemory.origin
    };

    const assemblyPipeline = function* (lines: Pipe) {
        for (const line of lines) {
            yield programMemory.addressStep(line);
            programMemory.reset(line);
        }
    };

    return {
        "originDirective": originDirective,
        "assemblyPipeline": assemblyPipeline
    };
};

export type ProgramMemoryPipeline = ReturnType<typeof programMemoryPipeline>;
