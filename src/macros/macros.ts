import { emptyBox, failure } from "../failure/failure-or-box.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import type { ActualParameters, MacroList } from "./data-types.ts";
import { lineWithProcessedMacro } from "./line-types.ts";
import { playback } from "./playback.ts";
import { recording } from "./recording.ts";

export const macros = (symbolTable: SymbolTable) => {
    const macros: MacroList = new Map();

    const player = playback(macros, symbolTable);

    const useMacroMethod = (macroName: string) => {
        symbolTable.add(
            macroName,
            (...parameters: ActualParameters) =>
                player.useMacroMethod(macroName, parameters)
        );
    };

    const recorder = recording(macros, useMacroMethod);

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
        "lines": lines
    };
};

export type Macros = ReturnType<typeof macros>;
