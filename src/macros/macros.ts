import { emptyBox } from "../failure/failure-or-box.ts";
import { FileLineIterator, FileStack } from "../source-code/file-stack.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import type { ActualParameters, MacroList } from "./data-types.ts";
import { recording } from "./recording.ts";
import { remapping } from "./remapping.ts";

export const macros = (symbolTable: SymbolTable, fileStack: FileStack) => {
    const macros: MacroList = new Map();
    const remap = remapping(macros);
    const record = recording(macros);

    function* imaginaryFile(macroName: string): FileLineIterator {
        const macroCount = symbolTable.count(macroName);
        for (const line of macros.get(macroName)!.lines) {
            yield [line.rawSource, macroName, macroCount!, false];
        }
    }

    record.useMacroMethod((macroName: string) => {
        symbolTable.add(
            macroName,
            (...actualParameters: ActualParameters) => {
                const setup = remap.parameterSetup(macroName, actualParameters);
                if (setup.which == "failure") {
                    return setup;
                }
                if (!record.isRecording()) {
                    fileStack.pushImaginary(imaginaryFile(macroName));
                }
                return emptyBox();
            },
            "",
            0
        );
    });

    const lines = (line: LineWithTokens) => record.isRecording()
        ? record.recorded(line)
        : remap.remapped(line);

    const resetState = () => {
        macros.clear();
        record.resetState();
    };

    return {
        "resetState": resetState,
        "leftInIllegalState": record.leftInIllegalState,
        "macroDirective": record.macroDirective,
        "endDirective": record.endDirective,
        "lines": lines
    };
};

export type Macros = ReturnType<typeof macros>;
