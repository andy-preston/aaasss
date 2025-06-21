import type { BooleanDirective, DataDirective } from "../directives/bags.ts";
import type { ObjectCode } from "./object-code.ts";

export const objectCodeCoupling = (objectCode: ObjectCode) => {

    const pokeDirective: DataDirective = {
        "type": "dataDirective", "it": objectCode.poke
    };

    const assembleIfDirective: BooleanDirective = {
        "type": "booleanDirective", "it": objectCode.assembleIf
    }

    return {
        "pokeDirective": pokeDirective,
        "assembleIfDirective": assembleIfDirective,
        "line": objectCode.line,
        "reset": objectCode.reset
    };
};
