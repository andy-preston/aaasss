import type { Pipe } from "../assembler/data-types.ts";
import type { NumberDirective, StringDirective } from "../directives/bags.ts";
import { Line } from "../line/line-types.ts";
import type { ProgramMemory } from "./program-memory.ts";

export const programMemoryPipeline = (programMemory: ProgramMemory) => {

    const originDirective: NumberDirective = {
        "type": "numberDirective", "it": programMemory.origin
    };

    const labelDirective: StringDirective = {
        "type": "stringDirective", "it": programMemory.label
    }

    const addressingPipeline = (line: Line) => {
        programMemory.lineAddress(line);
        programMemory.reset(line);
    };

    return {
        "originDirective": originDirective,
        "labelDirective": labelDirective,
        "addressingPipeline": addressingPipeline,
        "labelPipeline": programMemory.lineLabel
    };
};

export type ProgramMemoryPipeline = ReturnType<typeof programMemoryPipeline>;
