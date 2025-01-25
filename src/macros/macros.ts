import { emptyBox, failure } from "../failure/failure-or-box.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import type { Macro, MacroName } from "./data-types.ts";
import { lineWithProcessedMacro } from "./line-types.ts";
import { playback } from "./playback.ts";
import { recording } from "./recording.ts";

export type MacroList = Map<MacroName, Macro>;

export const macros = () => {
    const macros: MacroList = new Map();

    const recorder = recording(macros);
    const player = playback(macros);

    const lines = function* (line: LineWithTokens) {
        yield lineWithProcessedMacro(line, recorder.isRecording());
        const playback = player.play();
        if (playback != undefined) {
            yield* playback(line);
        }
        recorder.record(line);
    };

    const leftInIllegalState = () => recorder.isRecording()
        ? failure(undefined, "macro_define", undefined)
        : emptyBox();

    const reset = () => {
        macros.clear();
        recorder.reset();
        player.reset();
    };

    return {
        "reset": reset,
        "leftInIllegalState": leftInIllegalState,
        "macro": recorder.start,
        "end": recorder.end,
        "useMacro": player.directive,
        "lines": lines
    };
};

export type Macros = ReturnType<typeof macros>;
