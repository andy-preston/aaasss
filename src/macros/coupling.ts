import type { FunctionDefineDirective, VoidDirective } from "../directives/bags.ts";
import type { Macros } from "./macros.ts";

export const macroCoupling = (macros: Macros) => {
    const macroDirective: FunctionDefineDirective = {
        "type": "functionDefineDirective", "it": macros.define
    };

    const endDirective: VoidDirective = {
        "type": "voidDirective", "it": macros.end
    };

    return {
        "processedLine": macros.processedLine,
        "macroDirective": macroDirective,
        "endDirective": endDirective
    };
};
