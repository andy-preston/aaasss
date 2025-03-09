import { emptyBag } from "../assembler/bags.ts";
import type { FunctionDefineDirective, FunctionUseDirective, VoidDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import { currentFileName, currentLineNumber } from "../directives/global-line.ts";
import { oldFailure, bagOfFailures, type StringOrFailures } from "../failure/bags.ts";
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

    const define = (
        newName: MacroName, parameters: MacroParameters = []
    ): DirectiveResult => {
        if (theMacro != undefined) {
            return bagOfFailures([
                oldFailure("macro_multiDefine", [macroName])
            ]);
        }
        if (symbolTable.has(newName, "withRegisters")) {
            return bagOfFailures([
                oldFailure("macro_name", [newName])
            ]);
        }
        macroName = newName;
        theMacro = macro(parameters);
        skipFirstLine = true;
        return emptyBag();
    };

    const macroDirective: FunctionDefineDirective = {
        "type": "functionDefineDirective", "it": define
    };

    const end = (): DirectiveResult => {
        if (theMacro == undefined) {
            return bagOfFailures([
                oldFailure("macro_end", undefined)
            ]);
        }
        macros.set(macroName, theMacro!);
        symbolTable.add(
            macroName, useMacroDirective,
            currentFileName(), currentLineNumber()
        );
        resetState();
        return emptyBag();
    };

    const endDirective: VoidDirective = {
        "type": "voidDirective", "it": end
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

    const leftInIllegalState = (): StringOrFailures => isRecording()
        ? bagOfFailures([oldFailure("macro_noEnd", undefined)])
        : emptyBag()

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
