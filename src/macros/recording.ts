import type { FunctionDefineDirective, FunctionUseDirective, VoidDirective } from "../directives/data-types.ts";
import { currentFileName, currentLineNumber } from "../directives/global-line.ts";
import { box, emptyBox, failure } from "../failure/failure-or-box.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import { macro, MacroList, MacroParameters, type Macro, type MacroName } from "./data-types.ts";
import { lineWithProcessedMacro } from "./line-types.ts";

export const recording = (
    macros: MacroList,
    symbolTable: SymbolTable,
    useMacroDirective: FunctionUseDirective
) => {
    let theMacro: Macro | undefined = undefined;
    let macroName: MacroName = "";
    let skipFirstLine = false;

    const resetState = () => {
        theMacro = undefined;
        macroName = "";
    };

    const macroDirective: FunctionDefineDirective = {
        "type": "functionDefineDirective",
        "body": (newName: MacroName, parameters: MacroParameters = []) => {
            if (theMacro != undefined) {
                return failure(undefined, "macro_multiDefine", [macroName]);
            }
            if (symbolTable.has(newName, "withRegisters")) {
                return failure(undefined, "macro_name", [newName]);
            }
            macroName = newName;
            theMacro = macro(parameters);
            skipFirstLine = true;
            return box("");
        }
    };

    const endDirective: VoidDirective = {
        "type": "voidDirective",
        "body": () => {
            if (theMacro == undefined) {
                return failure(undefined, "macro_end", undefined);
            }
            macros.set(macroName, theMacro!);
            symbolTable.add(
                macroName, useMacroDirective,
                currentFileName(), currentLineNumber()
            );
            resetState();
            return box("");
        }
    };

    const isRecording = () => theMacro != undefined;

    const recorded = (line: LineWithTokens) => {
        if (skipFirstLine) {
            skipFirstLine = false;
        } else if (!line.failed()) {
            theMacro!.lines.push(line);
        }
        return lineWithProcessedMacro(line, true);
    };

    const leftInIllegalState = () => isRecording()
        ? failure(undefined, "macro_noEnd", undefined)
        : emptyBox();

    return {
        "resetState": resetState,
        "macroDirective": macroDirective,
        "endDirective": endDirective,
        "isRecording": isRecording,
        "recorded": recorded,
        "leftInIllegalState": leftInIllegalState
    };
};

export type Recording = ReturnType<typeof recording>;
