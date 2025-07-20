import type { PipelineProcess, PipelineReset } from "../assembler/data-types.ts";
import type { DirectiveResult, UncheckedParameters } from "../directives/data-types.ts";
import type { CurrentLine } from "../line/current-line.ts";
import type { FileStack } from "../source-code/file-stack.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { Macro, MacroList, MacroName } from "./data-types.ts";

import { addFailure } from "../failure/add-failure.ts";
import { boringFailure, clueFailure } from "../failure/bags.ts";
import { macro } from "./data-types.ts";
import { directiveParameters } from "./directive-parameters.ts";
import { remapping } from "./remapping.ts";

export const macros = (
    currentLine: CurrentLine, symbolTable: SymbolTable, fileStack: FileStack
) => {
    const macroList: MacroList = new Map();

    let definingMacro: Macro | undefined = undefined;
    let definingName: MacroName = "";

    const remap = remapping(macroList);

    const isDefining = () => definingMacro != undefined || definingName != "";

    const define = (
        ...uncheckedParameters: UncheckedParameters
    ): DirectiveResult => {
        if (isDefining()) {
            addFailure(currentLine().failures, clueFailure(
                "macro_multiDefine", definingName
            ));
            return undefined;
        }

        if (directiveParameters(uncheckedParameters, currentLine())) {
            return undefined;
        }

        const stringParameters = uncheckedParameters as Array<string>;
        const newName = stringParameters.shift()!;
        if (symbolTable.alreadyInUse(newName)) {
            return undefined;
        }

        definingName = newName;
        definingMacro = macro(stringParameters);
        return undefined;
    };

    const end = (): DirectiveResult => {
        if (!isDefining()) {
            addFailure(currentLine().failures, boringFailure("macro_end"));
            return;
        }

        macroList.set(definingName, definingMacro!);
        symbolTable.userSymbol(definingName, useDirective(definingName));
        definingMacro = undefined;
        definingName = "";
        return;
    };

    const useDirective = (
        macroName: string
    ) => (
        ...parameters: UncheckedParameters
    ): DirectiveResult => {
        const macro = macroList.get(macroName)!;
        const macroCount = symbolTable.count(macroName);
        const prepareFailure = remap.prepared(
            macroName, macroCount, macro, parameters
        );
        if (prepareFailure) {
            addFailure(currentLine().failures, prepareFailure);
            return undefined;
        }

        if (!isDefining()) {
            fileStack.pushImaginary(remap.imaginaryFile(macroName, macroCount));
        }
        return undefined;
    };

    const recordedLine = () => {
        const looksLikeEndDirective : boolean =
            currentLine().mnemonic == "."
            && currentLine().operands[0]!.match(/^end\(/) != null;

        if (!looksLikeEndDirective) {
            definingMacro!.lines.push({
                "sourceCode": currentLine().sourceCode,
                "label": currentLine().label
            });
            currentLine().label = "";
            currentLine().mnemonic = "";
            currentLine().operands = [];
        }
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
        "define": define, "end": end,
        "processedLine": processedLine, "reset": reset
    };
};

export type Macros = ReturnType<typeof macros>;
