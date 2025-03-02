import type { FunctionDefineDirective, FunctionUseDirective, ObsoleteDirective } from "../directives/data-types.ts";
import { currentFileName, currentLineNumber } from "../directives/global-line.ts";
import { parameterList, stringParameter } from "../directives/type-checking.ts";
import { emptyBox, failure } from "../failure/failure-or-box.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import { macro, MacroList, MacroParameters, type Macro, type MacroName } from "./data-types.ts";
import { lineWithProcessedMacro } from "./line-types.ts";

type UseMacroMethod = (macroName: string) => void;

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
            const checkedName = stringParameter(newName);
            if (checkedName.which == "failure") {
                return checkedName;
            }
            if (symbolTable.has(newName, "withRegisters")) {
                return failure(undefined, "macro_name", [newName]);
            }
            const checkedParameters = parameterList(parameters, "type_strings");
            if (checkedParameters.which == "failure") {
                return checkedParameters;
            }
            macroName = newName;
            theMacro = macro(
                checkedParameters.value == "undefined" ? [] : parameters
            );
            skipFirstLine = true;
            return emptyBox();
        }
    };

    const endDirective: ObsoleteDirective = {
        "type": "directive",
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
            return emptyBox();
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
