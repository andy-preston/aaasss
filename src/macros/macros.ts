import type { ActualParameters, DirectiveResult } from "../directives/data-types.ts";
import type { DirectiveList } from "../directives/directive-list.ts";
//import { currentFileName, currentLineNumber } from "../directives/global-line.ts";
import { box } from "../failure/failure-or-box.ts";
import type { FileLineIterator, FileStack } from "../source-code/file-stack.ts";
import { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import type { MacroList } from "./data-types.ts";
import { recording } from "./recording.ts";
import { remapping } from "./remapping.ts";

export const macros = (
    directiveList: DirectiveList,
    symbolTable: SymbolTable,
    fileStack: FileStack
) => {
    const macros: MacroList = new Map();
    const remap = remapping(macros);
    const record = recording(macros);

    function* imaginaryFile(macroName: string): FileLineIterator {
        const macroCount = symbolTable.count(macroName);
        for (const line of macros.get(macroName)!.lines) {
            yield [line.rawSource, macroName, macroCount!, false];
        }
    }

    const plop = (
        macroName: string, actualParameters: ActualParameters
    ): DirectiveResult => {
        const setup = remap.parameterSetup(macroName, actualParameters);
        if (setup.which == "failure") {
            return setup;
        }
        if (!record.isRecording()) {
            fileStack.pushImaginary(imaginaryFile(macroName));
        }
        return box("");

    }

    record.useMacroMethod((macroName: string) => {
        directiveList.includes(macroName, {
            "parametersType": "actualParameters",
            "method": plop
        });

        /*
        symbolTable.add(
            (_something: string, ) => {
            },
            currentFileName(),
            currentLineNumber()
        );
        */
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
