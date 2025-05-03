import type { FunctionDefineDirective, FunctionUseDirective, VoidDirective } from "../directives/bags.ts";
import type { Macros } from "./macros.ts";

export const macroPipeline = (macros: Macros) => {
    const macroDirective: FunctionDefineDirective = {
        "type": "functionDefineDirective", "it": macros.define
    };

    const endDirective: VoidDirective = {
        "type": "voidDirective", "it": macros.end
    };

    const useMacroDirective: FunctionUseDirective = {
        "type": "functionUseDirective", "it": macros.use
    };

    macros.directiveForMacroUse(useMacroDirective);

    return {
        "assemblyPipeline": macros.assemblyPipeline,
        "macroDirective": macroDirective,
        "endDirective": endDirective,
        "useMacroDirective": useMacroDirective
    };
};

export type MacroPipeline = ReturnType<typeof macroPipeline>;
