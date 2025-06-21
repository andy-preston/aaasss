import type { PipelineProcess, PipelineReset } from "../assembler/data-types.ts";
import type { FunctionUseDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import type { CurrentLine } from "../line/current-line.ts";
import type { FileStack } from "../source-code/file-stack.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { Macro, MacroList, MacroName, MacroParameters } from "./data-types.ts";

import { addFailure } from "../failure/add-failure.ts";
import { boringFailure, clueFailure } from "../failure/bags.ts";
import { macro } from "./data-types.ts";
import { remapping } from "./remapping.ts";
import { removedDirective } from "./removed-directive.ts";

export const macros = (
    currentLine: CurrentLine, symbolTable: SymbolTable, fileStack: FileStack
) => {
    const macroList: MacroList = new Map();

    let definingMacro: Macro | undefined = undefined;
    let definingName: MacroName = "";
    let firstLine = false;

    const remap = remapping(macroList);

    const isDefining = () => definingMacro != undefined || definingName != "";

    const define = (
        newName: MacroName, parameters: MacroParameters
    ): DirectiveResult => {
        if (isDefining()) {
            addFailure(currentLine().failures, clueFailure(
                "macro_multiDefine", definingName
            ));
            return;
        }
        if (symbolTable.alreadyInUse(newName)) {
            return;
        }
        definingName = newName;
        definingMacro = macro(parameters);
        firstLine = true;
    };

    const end = (): DirectiveResult => {
        if (!isDefining()) {
            addFailure(currentLine().failures, boringFailure("macro_end"));
            return;
        }

        macroList.set(definingName, definingMacro!);
        if (useMacroDirective == undefined) {
            throw new Error("Macro use directive is not defined");
        }
        symbolTable.userSymbol(definingName, useMacroDirective);
        definingMacro = undefined;
        definingName = "";
        return;
    };

    const use = (
        macroName: string, parameters: MacroParameters
    ): DirectiveResult => {
        const macro = macroList.get(macroName)!;
        const macroCount = symbolTable.count(macroName);
        const prepareFailure = remap.prepared(
            macroName, macroCount, macro, parameters
        );
        if (prepareFailure) {
            addFailure(currentLine().failures, prepareFailure);
            return;
        }

        if (!isDefining()) {
            fileStack.pushImaginary(remap.imaginaryFile(macroName, macroCount));
        }
    };

    const useMacroDirective: FunctionUseDirective = {
        "type": "functionUseDirective", "it": use
    };

    const taggedLine: PipelineProcess = () => {
        currentLine().isDefiningMacro = isDefining();
    };

    const recordedLine = () => {
        const lineToPush = firstLine
            ? removedDirective(definingName, currentLine()) : currentLine();
        if (lineToPush != undefined) {
            definingMacro!.lines.push(lineToPush);
        }
        firstLine = false;
    };

    const processedLine: PipelineProcess = () => {
        if (isDefining()) {
            recordedLine();
        } else {
            remap.remapped(currentLine());
        }
    };

    const reset: PipelineReset = () => {
        if (isDefining()) {
            addFailure(currentLine().failures, boringFailure("macro_noEnd"));
        }
        definingMacro = undefined;
        definingName = "";
        macroList.clear();
    };

    return {
        "define": define, "end": end, "use": use,
        "taggedLine": taggedLine, "processedLine": processedLine, "reset": reset
    };
};

export type Macros = ReturnType<typeof macros>;
