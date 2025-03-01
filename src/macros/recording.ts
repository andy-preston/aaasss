import type { Directive, ParameterDefinitions } from "../directives/data-types.ts";
import { box, emptyBox, failure } from "../failure/failure-or-box.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import { macro, type Macro, type MacroList, type MacroName } from "./data-types.ts";
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

    const defineMacroDirective: Directive = {
        "parametersType": "parameterDefinition",
        "method": (
            newName: MacroName, parameters: ParameterDefinitions = []
        ) => {
            if (theMacro != undefined) {
                return failure(undefined, "macro_multiDefine", [macroName]);
            }

            const validation = validParameters.parameterDefinition(
                [newName, ...parameters]
            );
            if (validation.which == "failure") {
                return validation;
            }

            if (macros.has(newName)) {
                return failure(undefined, "macro_name", [newName]);
            }

            macroName = newName;

            theMacro = macro(
                typedParameters.parameterDefinition(parameters)
            );
            skipFirstLine = true;
            return box("");
        }
    };

    const endDirective: Directive = {
        "parametersType": "void",
        "method": () => {
            if (theMacro == undefined) {
                return failure(undefined, "macro_end", undefined);
            }
            macros.set(macroName, theMacro!);
            useMacroMethod!(macroName);
            resetState();
            return box("");
        }
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
        "macroDirective": defineMacroDirective,
        "endDirective": endDirective,
        "isRecording": isRecording,
        "useMacroMethod": useMacroMethodAttachment,
        "recorded": recorded,
        "leftInIllegalState": leftInIllegalState
    };
};

export type Recording = ReturnType<typeof recording>;
