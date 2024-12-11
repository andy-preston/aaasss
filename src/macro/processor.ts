import { stringParameter } from "../coupling/type-checking.ts";
import {
    box, failure, type Box, type Failure
} from "../coupling/value-failure.ts";
import type { LineWithTokens } from "../tokenise/line-types.ts";
import { lineWithProcessedMacro } from "./line-types.ts";
import {
    macro,
    type ActualParameters, type SymbolicParameters,
    type MacroName, type Macro, type MacroMapper
} from "./macro.ts";

const symbolicCheck = (
    parameters: SymbolicParameters | undefined
): Box<SymbolicParameters> | Failure => {
    if (parameters == undefined) {
        return box([]);
    }
    if (!Array.isArray(parameters)) {
        return failure(undefined, "type.strings", typeof parameters)
    }
    const failed: Array<string> = [];
    for (const [index, parameter] of parameters.entries()) {
        const typeOf = typeof parameter;
        if (typeOf != "string") {
            failed.push(`${index}: ${typeOf}`);
        }
    }
    return failed.length > 0
        ? failure(undefined, "type.strings", failed.join(", "))
        : box(parameters);
}

const actualCheck = (
    parameters: ActualParameters | undefined
): Box<ActualParameters> | Failure => {
    if (parameters == undefined) {
        return box([]);
    }
    if (!Array.isArray(parameters)) {
        return failure(undefined, "type.params", typeof parameters)
    }
    const failed: Array<string> = [];
    for (const [index, parameter] of parameters.entries()) {
        const typeOf = typeof parameter;
        if (!["string", "number"].includes(typeOf)) {
            failed.push(`${index}: ${typeOf}`);
        }
    }
    return failed.length > 0
        ? failure(undefined, "type.params", failed.join(", "))
        : box(parameters);
}

export const processor = () => {
    let playback: MacroMapper | undefined;

    let recording: Macro | undefined;
    let recordingName: MacroName;

    let macros: Map<MacroName, Macro> = new Map();

    const leftInIllegalState = (): Array<Failure> => recording == undefined
        ? [] : [failure(undefined, "macro.define", undefined)];

    const reset = () => {
        macros = new Map();
        recording = undefined;
        playback = undefined;
    };

    const defineDirective = (
        name: MacroName, parameters: SymbolicParameters = []
    ): Box<string> | Failure => {
        if (recording != undefined) {
            return failure(undefined, "macro.define", undefined);
        }
        const checkedName = stringParameter(name);
        if (checkedName.which == "failure") {
            return checkedName;
        }
        if (macros.has(name)) {
            return failure(undefined, "macro.name", name);
        }
        const checkedParameters = symbolicCheck(parameters);
        if (checkedParameters.which == "failure") {
            return checkedParameters;
        }
        recordingName = name;
        recording = macro(name, checkedParameters.value);
        return box(name);
    };

    const endDirective = (): Box<string> | Failure => {
        if (recording == undefined) {
            return failure(undefined, "macro.end", undefined);
        }
        if (recording.empty()) {
            return failure(undefined, "macro.empty", undefined);
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

    const macroDirective = (
        name: MacroName, parameters: ActualParameters
    ): Box<string> | Failure => {
        const checkedName = stringParameter(name);
        if (checkedName.which == "failure") {
            return checkedName;
        }
        if (!macros.has(name)) {
            return failure(undefined, "macro.notExist", name);
        }
        const checkedParameters = actualCheck(parameters);
        if (checkedParameters.which == "failure") {
            return checkedParameters;
        }
        playback = macros.get(name)!.mapper(parameters);
        return box(name);
    };

    return {
        "reset": reset,
        "leftInIllegalState": leftInIllegalState,
        "defineDirective": defineDirective,
        "endDirective": endDirective,
        "macroDirective": macroDirective,
        "lines": lines
    };
};

export type MacroProcessor = ReturnType<typeof processor>;
