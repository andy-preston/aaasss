import type { FunctionDefineDirective, FunctionUseDirective, VoidDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import type { MacroList, MacroParameters, Macro, MacroName } from "./data-types.ts";

import { emptyBag } from "../assembler/bags.ts";
import { bagOfFailures, boringFailure, clueFailure } from "../failure/bags.ts";
import { macro } from "./data-types.ts";
import { lineWithProcessedMacro } from "./line-types.ts";

export const recording = (
    macroList: MacroList,
    symbolTable: SymbolTable,
    useMacroDirective: FunctionUseDirective
) => {
    let theMacro: Macro | undefined = undefined;
    let macroName: MacroName = "";

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
        const inUse = symbolTable.alreadyInUse(newName);
        if (inUse.type == "failures") {
            return inUse;
        }
        macroName = newName;
        theMacro = macro(parameters);
        return emptyBag();
    };

    const macroDirective: FunctionDefineDirective = {
        "type": "functionDefineDirective", "it": define
    };

    const end = (): DirectiveResult => {
        if (theMacro == undefined) {
            return bagOfFailures([boringFailure("macro_end")]);
        }
        macroList.set(macroName, theMacro!);
        symbolTable.userSymbol(macroName, useMacroDirective);
        resetState();
        return emptyBag();
    };

    const endDirective: VoidDirective = {
        "type": "voidDirective", "it": end
    };

    const isRecording = () => theMacro != undefined;

    const recorded = (line: LineWithTokens) => {
        if (line.assemblySource != "") {
            theMacro!.lines.push(line);
        }
        return lineWithProcessedMacro(line, true);
    };

    return {
        "resetState": resetState,
        "macroDirective": macroDirective,
        "endDirective": endDirective,
        "isRecording": isRecording,
        "recorded": recorded
    };
};

export type Recording = ReturnType<typeof recording>;
