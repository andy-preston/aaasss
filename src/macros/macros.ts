import type { PipelineProcess, PipelineReset } from "../assembler/data-types.ts";
import type { DirectiveResult, UncheckedParameters } from "../directives/data-types.ts";
import type { CurrentLine } from "../line/current-line.ts";
import type { Macro, MacroConstructor } from "./macro.ts";

import { addFailure } from "../failure/add-failure.ts";
import { boringFailure, clueFailure } from "../failure/bags.ts";

export const macros = (
    currentLine: CurrentLine, macro: MacroConstructor
) => {
    let currentMacro: Macro = undefined;

    const define = (
        ...uncheckedParameters: UncheckedParameters
    ): DirectiveResult => {
        if (currentMacro != undefined) {
            addFailure(currentLine().failures, clueFailure(
                "macro_multiDefine", currentMacro.name
            ));
            return undefined;
        }

        currentMacro = macro(uncheckedParameters);
        return undefined;
    };

    const end = (): DirectiveResult => {
        if (currentMacro == undefined) {
            addFailure(currentLine().failures, boringFailure("macro_end"));
            return;
        }

        currentMacro.save();
        currentMacro = undefined;
        return;
    };

    const processedLine: PipelineProcess = () => {
        if (currentMacro != undefined) {
            currentMacro.nextLine(currentLine());
        }
    };

    const reset: PipelineReset = () => {
        if (currentMacro != undefined) {
            addFailure(currentLine().failures, boringFailure("macro_noEnd"));
        }
        currentMacro = undefined;
    };

    return {
        "define": define, "end": end,
        "processedLine": processedLine, "reset": reset
    };
};

export type Macros = ReturnType<typeof macros>;
