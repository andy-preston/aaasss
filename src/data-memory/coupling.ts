import type { NumberDirective } from "../directives/bags.ts";
import type { DataMemory } from "./data-memory.ts";

export const dataMemoryCoupling = (dataMemory: DataMemory) => {
    const allocDirective: NumberDirective = {
        "type": "numberDirective", "it": dataMemory.alloc
    };

    const allocStackDirective: NumberDirective = {
        "type": "numberDirective", "it": dataMemory.allocStack
    };

    return {
        "allocDirective": allocDirective,
        "allocStackDirective": allocStackDirective,
        "reset": dataMemory.reset
    }
}