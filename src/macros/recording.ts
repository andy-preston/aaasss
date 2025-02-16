import type { Directive } from "../directives/data-types.ts";
import { parameterList, stringParameter } from "../directives/type-checking.ts";
import { emptyBox, failure } from "../failure/failure-or-box.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import { macro, type DefinedParameters, type Macro, type MacroList, type MacroName } from "./data-types.ts";
import { lineWithProcessedMacro } from "./line-types.ts";

export const recording = (
    macros: MacroList,
    useMacroMethod: (macroName: string) => void
) => {
    let theMacro: Macro | undefined = undefined;
    let macroName: MacroName = "";
    let skipFirstLine = false;

    const reset = () => {
        theMacro = undefined;
        macroName = "";
    };

    const start: Directive = (
        name: MacroName, parameters: DefinedParameters = []
    ) => {
        if (theMacro != undefined) {
            return failure(undefined, "macro_multiDefine", macroName);
        }
        const checkedName = stringParameter(name);
        if (checkedName.which == "failure") {
            return checkedName;
        }
        if (macros.has(name)) {
            return failure(undefined, "macro_name", name);
        }
        const checkedParameters = parameterList(parameters, "type_strings");
        if (checkedParameters.which == "failure") {
            return checkedParameters;
        }
        macroName = name;
        theMacro = macro(
            checkedParameters.value == "undefined" ? [] : parameters
        );
        skipFirstLine = true;
        return emptyBox();
    };

    const end: Directive = () => {
        if (theMacro == undefined) {
            return failure(undefined, "macro_end", undefined);
        }
        macros.set(macroName, theMacro!);
        useMacroMethod(macroName);
        reset();
        return emptyBox();
    };

    const isRecording = () => theMacro != undefined;

    const recorded = (line: LineWithTokens) => {
        if (isRecording()) {
            if (skipFirstLine) {
                skipFirstLine = false;
            } else {
                theMacro!.lines.push(line);
            }
        }
        return lineWithProcessedMacro(line, isRecording());
    };

    const leftInIllegalState = () => isRecording()
        ? failure(undefined, "macro_noEnd", undefined)
        : emptyBox();

    return {
        "reset": reset,
        "start": start,
        "end": end,
        "recorded": recorded,
        "leftInIllegalState": leftInIllegalState
    };
};

export type Recording = ReturnType<typeof recording>;
