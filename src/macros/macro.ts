import type { DirectiveResult } from "../directives/data-types.ts";
import type { CurrentLine } from "../line/current-line.ts";
import type { Line } from "../line/line-types.ts";
import type { FileLineIterator, SourceCode } from "../source-code/data-types.ts";
import type { FileStack } from "../source-code/file-stack.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { MacroParameters } from "./parameters.ts";

import { defineParameters, nameAndParameters, useParameters } from "./parameters.ts";

export const macroConstructor = (
    currentLine: CurrentLine, symbolTable: SymbolTable, fileStack: FileStack
) => (
    uncheckedParameters: MacroParameters
) => {
    const lines: Array<SourceCode> = [];
    const parametersGood = defineParameters(
        uncheckedParameters, currentLine().failures
    );
    if (!parametersGood) {
        return undefined;
    }

    const [macroName, parameterDefinitions] = nameAndParameters(
        uncheckedParameters
    );
    if (symbolTable.failIfInUse(macroName)) {
        return undefined;
    }

    const imaginaryFile = function* (symbolSuffix: string): FileLineIterator {
        for (const line of lines) {
            yield [line, symbolSuffix, false];
        }
    };

    const useDirective = (
        ...uncheckedParameters: MacroParameters
    ): DirectiveResult => {
        const macroCount = symbolTable.count(macroName);
        const suffix = `$${macroName}$${macroCount}`;
        currentLine().symbolSuffix = suffix;
        const parametersUsable = useParameters(
            parameterDefinitions, uncheckedParameters,
            currentLine().failures, symbolTable
        );
        if (parametersUsable) {
            fileStack.pushImaginary(imaginaryFile(suffix));
        }
        return undefined;
    };

    const save = () => {
        symbolTable.userSymbol(macroName, useDirective);
    };

    const nextLine = (line: Line) => {
        const looksLikeEndDirective: boolean = line.mnemonic == "."
            && line.operands[0]!.match(/^end\(/) != null;
        if (!looksLikeEndDirective) {
            lines.push(line.sourceCode);
            line.label = "";
            line.mnemonic = "";
            line.operands = [];
        }
    };

    return {
        "name": macroName,
        "nextLine": nextLine,
        "save": save
    }
};

export type MacroConstructor = ReturnType<typeof macroConstructor>;

export type Macro = ReturnType<MacroConstructor>;
