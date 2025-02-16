import { emptyBox } from "../failure/failure-or-box.ts";
import { FileLineIterator, FileStack } from "../source-code/file-stack.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import type { ActualParameters, MacroList } from "./data-types.ts";
import { playback } from "./playback.ts";
import { recording } from "./recording.ts";

export const macros = (symbolTable: SymbolTable, fileStack: FileStack) => {
    const macros: MacroList = new Map();
    const player = playback(macros);
    const recorder = recording(macros);

    function* imaginaryFile(macroName: string): FileLineIterator {
        const macroCount = symbolTable.count(macroName);
        for (const line of macros.get(macroName)!.lines) {
            yield [line.rawSource, macroName, macroCount, false];
        }
    }

    recorder.useMacroMethod((macroName: string) => {
        symbolTable.add(
            macroName,
            (...actualParameters: ActualParameters) => {
                const setup = player.parameterSetup(macroName, actualParameters);
                if (setup.which == "failure") {
                    return setup;
                }
                if (!recorder.isRecording()) {
                    fileStack.pushImaginary(imaginaryFile(macroName));
                }
                return emptyBox();
            }
        );
    });

    const lines = (line: LineWithTokens) => recorder.isRecording()
        ? recorder.recorded(line)
        : player.remapped(line);

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
