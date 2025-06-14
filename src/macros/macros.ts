import type { PipelineStage } from "../assembler/data-types.ts";
import type { FunctionUseDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import type { Line } from "../line/line-types.ts";
import type { FileStack } from "../source-code/file-stack.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { Macro, MacroList, MacroName, MacroParameters } from "./data-types.ts";

import { emptyBag } from "../assembler/bags.ts";
import { assertionFailure, bagOfFailures, boringFailure, clueFailure } from "../failure/bags.ts";
import { macro } from "./data-types.ts";
import { remapping } from "./remapping.ts";
import { removedDirective } from "./removed-directive.ts";

export const macros = (symbolTable: SymbolTable, fileStack: FileStack) => {
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
        firstLine = true;
        return emptyBag();
    };

    const end = (): DirectiveResult => {
        if (!isDefining()) {
            return bagOfFailures([boringFailure("macro_end")]);
        }

        macroList.set(definingName, definingMacro!);
        if (useMacroDirective == undefined) {
            throw new Error("Macro use directive is not defined");
        }
        symbolTable.userSymbol(definingName, useMacroDirective);
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

    const useMacroDirective: FunctionUseDirective = {
        "type": "functionUseDirective", "it": use
    };

    const taggedLine = (line: Line) => {
        line.isDefiningMacro = isDefining();
    };

    const recordedLine = (line: Line) => {
        const lineToPush = firstLine
            ? removedDirective(definingName, line) : line;
        if (lineToPush != undefined) {
            definingMacro!.lines.push(lineToPush);
        }
        firstLine = false;
    };

    const processedLine: PipelineStage = (line: Line) => {
        if (isDefining()) {
            recordedLine(line);
            if (line.lastLine) {
                line.failures.push(boringFailure("macro_noEnd"));
            }
        } else {
            remap.remapped(line);
        }
        if (line.lastLine) {
            definingMacro = undefined;
            definingName = "";
            macroList.clear();
        }
    };

    return {
        "define": define, "end": end, "use": use,
        "taggedLine": taggedLine, "processedLine": processedLine
    };
};

export type Macros = ReturnType<typeof macros>;
