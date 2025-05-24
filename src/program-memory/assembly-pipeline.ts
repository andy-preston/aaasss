import type { NumberDirective, StringDirective } from "../directives/bags.ts";
import type { ProgramMemory } from "./program-memory.ts";

export const programMemoryPipeline = (programMemory: ProgramMemory) => {

    const originDirective: NumberDirective = {
        "type": "numberDirective", "it": programMemory.origin
    };

    const labelDirective: StringDirective = {
        "type": "stringDirective", "it": programMemory.label
    }

    return {
        "originDirective": originDirective,
        "labelDirective": labelDirective,
        "lineAddress": programMemory.lineAddress,
        "lineLabel": programMemory.lineLabel
    };
};

export type ProgramMemoryPipeline = ReturnType<typeof programMemoryPipeline>;
