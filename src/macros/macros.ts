import type { PipelineProcess, PipelineReset } from "../assembler/data-types.ts";
import type { DirectiveResult, UncheckedParameters } from "../directives/data-types.ts";
import type { CurrentLine } from "../line/current-line.ts";
import type { FileStack } from "../source-code/file-stack.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { Macro, MacroList, MacroName } from "./data-types.ts";

import { typeOf } from "../assembler/data-types.ts";
import { addFailure } from "../failure/add-failure.ts";
import { assertionFailure, boringFailure, clueFailure } from "../failure/bags.ts";
import { macro } from "./data-types.ts";
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
        ...directiveParameters: UncheckedParameters
    ): DirectiveResult => {
        if (isDefining()) {
            addFailure(currentLine().failures, clueFailure(
                "macro_multiDefine", definingName
            ));
            return undefined;
        }

        if (directiveParameters.length < 1) {
            addFailure(currentLine().failures, assertionFailure(
                "parameter_count", ">=1", `${directiveParameters.length}`
            ));
            return undefined;
        }

        const badParameters = directiveParameters.reduce(
            (allGood, parameter, index) => {
                const actual = typeOf(parameter);
                if (actual != "string") {
                    const failure = assertionFailure(
                        "parameter_type", "string", actual
                    );
                    failure.location = {"parameter": index + 1};
                    addFailure(currentLine().failures, failure);
                    return true;
                }
                return allGood;
            }, false
        );
        if (badParameters) {
            return undefined;
        }

        const stringParameters = directiveParameters as Array<string>;
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

    const taggedLine: PipelineProcess = () => {
        currentLine().isDefiningMacro = isDefining();
    };

    const looksLikeEndDirective = (): boolean => {
        if (currentLine().mnemonic != ".") {
            return false;
        }
        if (currentLine().operands.length == 0) {
            return false;
        }
        const firstMatches = currentLine().operands[0]!.replace(
            /\s/g, ""
        ).match(
            /^end\(\);?$/
        );
        if (firstMatches == null) {
            return false;
        }
        return true;
    };

    const recordedLine = () => {
        if (looksLikeEndDirective()) {
            currentLine().isDefiningMacro = false;
        } else {
            definingMacro!.lines.push(currentLine());
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
        "taggedLine": taggedLine, "processedLine": processedLine, "reset": reset
    };
};

export type Macros = ReturnType<typeof macros>;
