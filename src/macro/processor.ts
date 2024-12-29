import { Directive } from "../context/context.ts";
import { box } from "../coupling/boxed-value.ts";
import { parameterList, stringParameter } from "../directives/type-checking.ts";
import { failure, type Failure } from "../failure/failures.ts";
import type { LineWithTokens } from "../tokenise/line-types.ts";
import { lineWithProcessedMacro } from "./line-types.ts";
import {
    macro,
    type ActualParameters, type SymbolicParameters,
    type MacroName, type Macro, type MacroMapper
} from "./macro.ts";

export const processor = () => {
    let playback: MacroMapper | undefined;

    let recording: Macro | undefined;
    let recordingName: MacroName;

    let macros: Map<MacroName, Macro> = new Map();

    const leftInIllegalState = (): Array<Failure> => recording == undefined
        ? [] : [failure(undefined, "macro_define", undefined)];

    const reset = () => {
        macros = new Map();
        recording = undefined;
        playback = undefined;
    };

    const define: Directive = (
        name: MacroName, parameters: SymbolicParameters = []
    ) => {
        if (recording != undefined) {
            return failure(undefined, "macro_define", undefined);
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
        recordingName = name;
        recording = macro(
            name,
            checkedParameters.value == "undefined" ? [] : parameters
        );
        return box(name);
    };

    const end: Directive = () => {
        if (recording == undefined) {
            return failure(undefined, "macro_end", undefined);
        }
        if (recording.empty()) {
            return failure(undefined, "macro_empty", undefined);
        }
        macros.set(recordingName, recording);
        recording = undefined;
        return box(recordingName);
    };

    const lines = function* (line: LineWithTokens) {
        if (playback != undefined) {
            yield* playback(line);
            playback = undefined;
        }
        if (recording != undefined) {
            recording.push(line);
        }
        yield lineWithProcessedMacro(
            line,
            recording == undefined ? "" : recordingName,
            []
        );
    };

    const macroDirective: Directive = (
        name: MacroName, parameters: ActualParameters
    ) => {
        const checkedName = stringParameter(name);
        if (checkedName.which == "failure") {
            return checkedName;
        }
        if (!macros.has(name)) {
            return failure(undefined, "macro_notExist", name);
        }
        const checkedParameters = parameterList(parameters, "type_params");
        if (checkedParameters.which == "failure") {
            return checkedParameters;
        }
        playback = macros.get(name)!.mapper(
            checkedParameters.value == "undefined" ? [] : parameters
        );
        return box(name);
    };

    return {
        "reset": reset,
        "leftInIllegalState": leftInIllegalState,
        "define": define,
        "end": end,
        "macro": macroDirective,
        "lines": lines
    };
};

export type MacroProcessor = ReturnType<typeof processor>;
