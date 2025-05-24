import { DataDirective } from "../directives/bags.ts";
import { ObjectCode } from "./object-code.ts";

export const objectCodePipeline = (objectCode: ObjectCode) => {

    const pokeDirective: DataDirective = {
        "type": "dataDirective", "it": objectCode.poke
    };

    return {
        "pokeDirective": pokeDirective,
        "line": objectCode.line
    };
};

export type ObjectCodePipeline = ReturnType<typeof objectCodePipeline>;
