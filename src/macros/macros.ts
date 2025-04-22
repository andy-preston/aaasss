import type { FunctionUseDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import type { FileLineIterator, FileStack } from "../source-code/file-stack.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import type { MacroList, MacroParameters } from "./data-types.ts";

import { emptyBag } from "../assembler/bags.ts";
import { assertionFailure, bagOfFailures } from "../failure/bags.ts";
import { recording } from "./recording.ts";
import { remapping } from "./remapping.ts";

export const macros = (symbolTable: SymbolTable, fileStack: FileStack) => {
    const macroList: MacroList = new Map();

    const remap = remapping(macroList);

    function* imaginaryFile(
        macroName: string, macroCount: number
    ): FileLineIterator {
        for (const line of macroList.get(macroName)!.lines) {
            yield [line.rawSource, macroName, macroCount!, false];
        }
        remap.completed(macroName, macroCount);
    }

    const useMacro = (
        macroName: string, parameters: MacroParameters
    ): DirectiveResult => {
        const macro = macroList.get(macroName)!;
        if (parameters.length != macro.parameters.length) {
            return bagOfFailures([assertionFailure(
                "macro_params",
                `${macro.parameters.length}`, `${parameters.length}`
            )]);
        }

        const macroCount = symbolTable.count(macroName);
        const prepared = remap.prepared(macroName, macroCount, macro, parameters);
        if (prepared.type == "failures") {
            return prepared;
        }

        if (!record.isRecording()) {
            fileStack.pushImaginary(imaginaryFile(macroName, macroCount));
        }
        return emptyBag();
    };

    const useMacroDirective: FunctionUseDirective = {
        "type": "functionUseDirective", "it": useMacro
    };

    const record = recording(macroList, symbolTable, useMacroDirective);

    const lines = (line: LineWithTokens) => record.isRecording()
        ? record.recorded(line)
        : remap.remapped(line);

    const resetState = () => {
        macroList.clear();
        record.resetState();
    };

    return {
        "resetState": resetState,
        "leftInIllegalState": record.leftInIllegalState,
        "useMacroDirective": useMacroDirective,
        "macroDirective": record.macroDirective,
        "endDirective": record.endDirective,
        "lines": lines
    };
};

export type Macros = ReturnType<typeof macros>;
