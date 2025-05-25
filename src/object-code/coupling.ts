import type { DataDirective } from "../directives/bags.ts";
import type { ObjectCode } from "./object-code.ts";

export const objectCodeCoupling = (objectCode: ObjectCode) => {

    const pokeDirective: DataDirective = {
        "type": "dataDirective", "it": objectCode.poke
    };

    return {
        "pokeDirective": pokeDirective,
        "line": objectCode.line
    };
};
