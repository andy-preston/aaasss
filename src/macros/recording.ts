import type { Directive } from "../directives/data-types.ts";
import { parameterList, stringParameter } from "../directives/type-checking.ts";
import { emptyBox, failure } from "../failure/failure-or-box.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import { macro, type DefinedParameters, type Macro, type MacroList, type MacroName } from "./data-types.ts";
import { lineWithProcessedMacro } from "./line-types.ts";

type UseMacroMethod = (macroName: string) => void;

export const recording = (macros: MacroList) => {
    let theMacro: Macro | undefined = undefined;
    let macroName: MacroName = "";
    let skipFirstLine = false;
    let useMacroMethod: UseMacroMethod | undefined

    const resetState = () => {
        theMacro = undefined;
        macroName = "";
    };

    const useMacroMethodAttachment = (method: UseMacroMethod) => {
        useMacroMethod = method;
    };

    const macroDirective: Directive = (
        newName: MacroName, parameters: DefinedParameters = []
    ) => {
        if (theMacro != undefined) {
            return failure(undefined, "macro_multiDefine", [macroName]);
        }
        const checkedName = stringParameter(newName);
        if (checkedName.which == "failure") {
            return checkedName;
        }
        if (macros.has(newName)) {
            return failure(undefined, "macro_name", [newName]);
        }
        const checkedParameters = parameterList(parameters, "type_strings");
        if (checkedParameters.which == "failure") {
            return checkedParameters;
        }
        macroName = newName;
        theMacro = macro(
            checkedParameters.value == "undefined" ? [] : parameters
        );
        skipFirstLine = true;
        return emptyBox();
    };

    const endDirective: Directive = () => {
        if (theMacro == undefined) {
            return failure(undefined, "macro_end", undefined);
        }
        macros.set(macroName, theMacro!);
        useMacroMethod!(macroName);
        resetState();
        return emptyBox();
    };

    const isRecording = () => theMacro != undefined;

    const recorded = (line: LineWithTokens) => {
        if (skipFirstLine) {
            skipFirstLine = false;
        } else if (!line.failed()) {
            theMacro!.lines.push(line);
        }
        return lineWithProcessedMacro(line, true);
    };

    const leftInIllegalState = () => isRecording()
        ? failure(undefined, "macro_noEnd", undefined)
        : emptyBox();

    return {
        "resetState": resetState,
        "macroDirective": macroDirective,
        "endDirective": endDirective,
        "isRecording": isRecording,
        "useMacroMethod": useMacroMethodAttachment,
        "recorded": recorded,
        "leftInIllegalState": leftInIllegalState
    };
};

export type Recording = ReturnType<typeof recording>;
