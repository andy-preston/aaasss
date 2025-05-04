import type { FunctionUseDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import type { FileStack } from "../source-code/file-stack.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import type { Macro, MacroList, MacroName, MacroParameters } from "./data-types.ts";

import { emptyBag } from "../assembler/bags.ts";
import { assertionFailure, bagOfFailures, boringFailure, clueFailure } from "../failure/bags.ts";
import { macro } from "./data-types.ts";
import { remapping } from "./remapping.ts";
import { lineWithProcessedMacro } from "./line-types.ts";

export const macros = (
    symbolTable: SymbolTable, fileStack: FileStack
) => {
    const macroList: MacroList = new Map();
    let definingMacro: Macro | undefined = undefined;
    let definingName: MacroName = "";
    let useMacroDirective: FunctionUseDirective | undefined = undefined;

    const remap = remapping(macroList);

    const directiveForMacroUse = (directive: FunctionUseDirective) => {
        useMacroDirective = directive;
    };

    const isDefining = () => definingMacro != undefined || definingName != "";

    const define = (
        newName: MacroName, parameters: MacroParameters
    ): DirectiveResult => {
        if (isDefining()) {
            return bagOfFailures([
                clueFailure("macro_multiDefine", definingName)
            ]);
        }

        const inUse = symbolTable.alreadyInUse(newName);
        if (inUse.type == "failures") {
            return inUse;
        }

        definingName = newName;
        definingMacro = macro(parameters);
        return emptyBag();
    };

    const end = (): DirectiveResult => {
        if (!isDefining()) {
            return bagOfFailures([boringFailure("macro_end")]);
        }

        macroList.set(definingName, definingMacro!);
        if (useMacroDirective != undefined) {
            symbolTable.userSymbol(definingName, useMacroDirective);
        }
        definingMacro = undefined;
        definingName = "";
        return emptyBag();
    };

    const use = (
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
        const prepared = remap.prepared(
            macroName, macroCount, macro, parameters
        );
        if (prepared.type == "failures") {
            return prepared;
        }

        if (!isDefining()) {
            fileStack.pushImaginary(remap.imaginaryFile(macroName, macroCount));
        }
        return emptyBag();
    };

    const recordedLine = (line: LineWithTokens) => {
        if (line.assemblySource != "") {
            definingMacro!.lines.push(line);
        }
        return lineWithProcessedMacro(line, true);
    };

    const processedLine = (line: LineWithTokens) => {
        const processed = isDefining()
            ? recordedLine(line) : remap.remapped(line);
        if (line.lastLine && isDefining()) {
            processed.withFailures([boringFailure("macro_noEnd")]);
        }
        return processed;
    };

    const lastLine = (line: LineWithTokens) => {
        if (line.lastLine) {
            definingMacro = undefined;
            definingName = "";
            macroList.clear();
        }
    };

    return {
        "define": define,
        "end": end,
        "use": use,
        "processedLine": processedLine,
        "lastLine": lastLine,
        "directiveForMacroUse": directiveForMacroUse
    };
};

export type Macros = ReturnType<typeof macros>;
