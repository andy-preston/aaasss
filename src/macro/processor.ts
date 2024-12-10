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
        name: MacroName, parameters?: SymbolicParameters
    ): Box<string> | Failure => {
        if (recording != undefined) {
            return failure(undefined, "macro.define", undefined);
        }
        if (macros.has(name)) {
            return failure(undefined, "macro.name", name);
        }
        recordingName = name;
        recording = macro(name, parameters == undefined ? [] : parameters);
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
        if (!macros.has(name)) {
            return failure(undefined, "macro.notExist", name);
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
