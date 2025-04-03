import { emptyBag } from "../assembler/bags.ts";
import type { FunctionDefineDirective, FunctionUseDirective, VoidDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import { bagOfFailures, boringFailure, clueFailure, type StringOrFailures } from "../failure/bags.ts";
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
            return bagOfFailures([clueFailure("macro_multiDefine", macroName)]);
        }
        if (symbolTable.alreadyInUse(newName)) {
            return bagOfFailures([clueFailure("macro_name", newName)]);
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
            return bagOfFailures([boringFailure("macro_end")]);
        }
        macros.set(macroName, theMacro!);
        symbolTable.userSymbol(macroName, useMacroDirective);
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
        ? bagOfFailures([boringFailure("macro_noEnd")])
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
