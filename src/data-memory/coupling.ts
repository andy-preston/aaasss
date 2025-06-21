import type { NumberDirective, ValueDirective } from "../directives/bags.ts";
import type { DataMemory } from "./data-memory.ts";

export const dataMemoryCoupling = (dataMemory: DataMemory) => {
    const allocDirective: ValueDirective = {
        "type": "valueDirective", "it": dataMemory.alloc
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