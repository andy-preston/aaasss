import { FileStack } from "../source-code/file-stack.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import type { ActualParameters, MacroList } from "./data-types.ts";
import { playback } from "./playback.ts";
import { recording } from "./recording.ts";

export const macros = (symbolTable: SymbolTable, fileStack: FileStack) => {
    const macros: MacroList = new Map();

    const player = playback(macros, symbolTable, fileStack);

    const useMacroMethod = (macroName: string) => {
        symbolTable.add(
            macroName,
            (...parameters: ActualParameters) =>
                player.useMacroMethod(macroName, parameters)
        );
    };

    const recorder = recording(macros, useMacroMethod);

    const lines = (line: LineWithTokens) =>
        player.remapped(recorder.recorded(line));

    const reset = () => {
        macros.clear();
        recorder.reset();
    };

    return {
        "reset": reset,
        "leftInIllegalState": recorder.leftInIllegalState,
        "macro": recorder.start,
        "end": recorder.end,
        "lines": lines
    };
};

export type Macros = ReturnType<typeof macros>;
