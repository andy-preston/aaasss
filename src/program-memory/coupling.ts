import type { NumberDirective } from "../directives/bags.ts";
import type { ProgramMemory } from "./program-memory.ts";

export const programMemoryCoupling = (programMemory: ProgramMemory) => {

    const originDirective: NumberDirective = {
        "type": "numberDirective", "it": programMemory.origin
    };

    return {
        "originDirective": originDirective,
        "reset": programMemory.reset,
        "lineAddress": programMemory.lineAddress,
        "lineLabel": programMemory.lineLabel
    };
};
