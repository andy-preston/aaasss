import type { Directive } from "../directives/data-types.ts";
import { parameterList, stringParameter } from "../directives/type-checking.ts";
import { emptyBox, failure } from "../failure/failure-or-box.ts";
import { LineWithTokens } from "../tokens/line-types.ts";
import { macro, type DefinedParameters, type Macro, type MacroName } from "./data-types.ts";
import type { MacroList } from "./macros.ts";

export const recording = (macros: MacroList) => {
    let theMacro: Macro | undefined = undefined;
    let macroName: MacroName = "";

    const reset = () => {
        theMacro = undefined;
        macroName = "";
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
        macros.set(macroName, theMacro);
        reset();
        return emptyBox();
    };

    const isRecording = () => theMacro != undefined

    const record = (line: LineWithTokens) => {
        if (isRecording() && line.hasAssembly()) {
            theMacro!.lines.push(line);
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
