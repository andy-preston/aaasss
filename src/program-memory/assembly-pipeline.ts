import type { Pipe } from "../assembler/data-types.ts";
import type { NumberDirective, StringDirective } from "../directives/bags.ts";
import { ImmutableLine } from "../line/line-types.ts";
import type { ProgramMemory } from "./program-memory.ts";

export const programMemoryPipeline = (programMemory: ProgramMemory) => {

    const originDirective: NumberDirective = {
        "type": "numberDirective", "it": programMemory.origin
    };

    const labelDirective: StringDirective = {
        "type": "stringDirective", "it": programMemory.label
    }

    /*
    const assemblyPipeline = function* (lines: Pipe) {
        for (const line of lines) {
            yield programMemory.addressStep(line);
            programMemory.reset(line);
        }
    };
    */

    const addressingPipeline = function* (lines: Pipe) {
        for (const line of lines) {
            yield programMemory.lineAddress(line);
            //programMemory.reset(line);
        }
    };

    const labelPipeline = function* (lines: Pipe) {
        for (const line of lines) {
            yield programMemory.lineLabel(line) as ImmutableLine;
            //programMemory.reset(line);
        }
    }

    return {
        "originDirective": originDirective,
        "labelDirective": labelDirective,
        "addressingPipeline": addressingPipeline,
        "labelPipeline": labelPipeline,

        //"assemblyPipeline": assemblyPipeline
    };
};

export type ProgramMemoryPipeline = ReturnType<typeof programMemoryPipeline>;
