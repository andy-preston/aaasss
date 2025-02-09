import type { Directive } from "../directives/data-types.ts";
import { parameterList, stringParameter } from "../directives/type-checking.ts";
import { emptyBox, failure } from "../failure/failure-or-box.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import { macro, type DefinedParameters, type Macro, type MacroList, type MacroName } from "./data-types.ts";

export const recording = (
    macros: MacroList,
    useMacroMethod: (macroName: string) => void
) => {
    let theMacro: Macro | undefined = undefined;
    let macroName: MacroName = "";
    let onLastLine = false;

    const reset = () => {
        theMacro = undefined;
        macroName = "";
        onLastLine = false;
    };

    const start: Directive = (
        name: MacroName, parameters: DefinedParameters = []
    ) => {
        if (theMacro != undefined) {
            return failure(undefined, "macro_define", macroName);
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
        return emptyBox();
    };

    const end: Directive = () => {
        if (theMacro == undefined) {
            return failure(undefined, "macro_end", undefined);
        }
        if (theMacro.lines.length == 0) {
            return failure(undefined, "macro_empty", undefined);
        }
        onLastLine = true;
        return emptyBox();
    };

    const theLastLine = () => {
        macros.set(macroName, theMacro!);
        useMacroMethod(macroName);
        reset();
    };

    const isRecording = () => theMacro != undefined;

    const shouldRecordThis = (line: LineWithTokens) =>
        line.hasAssembly() || onLastLine;

    const record = (line: LineWithTokens) => {
        if (isRecording() && shouldRecordThis(line)) {
            theMacro!.lines.push(line);
            if (onLastLine) {
                theLastLine();
            }
        }
    };

    return {
        "reset": reset,
        "start": start,
        "end": end,
        "record": record,
        "isRecording": isRecording
    };
};

export type Recording = ReturnType<typeof recording>;
