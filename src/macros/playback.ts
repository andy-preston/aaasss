import { parameterList } from "../directives/type-checking.ts";
import { emptyBox, failure, type Box, type Failure } from "../failure/failure-or-box.ts";
import { SymbolicOperand } from "../operands/data-types.ts";
import { FileLineIterator, FileStack } from "../source-code/file-stack.ts";
import { SymbolTable } from "../symbol-table/symbol-table.ts";
import { Label } from "../tokens/data-types.ts";
import { LineWithTokens } from "../tokens/line-types.ts";
import type { ActualParameters, Macro, MacroList, MacroName } from "./data-types.ts";
import { LineWithProcessedMacro, lineWithRemappedMacro } from "./line-types.ts";

export type MacroInvocation = (
    ...parameters: ActualParameters
) => Box<undefined> | Failure;

export const playback = (
    macros: MacroList, symbolTable: SymbolTable, fileStack: FileStack
) => {
    const parameterMap: Map<MacroName, ActualParameters> = new Map([]);

    function* imaginaryFile(
        macroName: string, theMacro: Macro
    ): FileLineIterator {
        const macroCount = symbolTable.count(macroName);
        for (const line of theMacro.lines) {
            yield [line.rawSource, macroName, macroCount, false];
        }
    }

    const useMacroMethod = (
        macroName: MacroName, actualParameters: ActualParameters
    ) => {
        const checkedParameters = parameterList(actualParameters, "type_macroParams");
        if (checkedParameters.which == "failure") {
            return checkedParameters;
        }
        const theMacro = macros.get(macroName)!;
        if (theMacro.parameters.length != actualParameters.length) {
            return failure(
                undefined, "macro_params", `${theMacro.parameters.length}`
            );
        }
        parameterMap.set(
            macroName,
            checkedParameters.value == "undefined" ? [] : actualParameters
        );
        fileStack.pushImaginary(imaginaryFile(macroName, theMacro));
        return emptyBox();
    };

    const expandedLabel = (line: LineWithTokens, label: Label) =>
        `${line.macroName}$${line.macroCount}$${label}`;

    const remappedLabel = (line: LineWithTokens) =>
        line.label ? expandedLabel(line, line.label) : "";

    const remappedParameters = (line: LineWithTokens) => {
        const theMacro = macros.get(line.macroName)!;
        const actualParameters = parameterMap.get(line.macroName)!;

        const isLabel = (parameter: SymbolicOperand) =>
            theMacro.lines.find(
                line => line.label == parameter
            ) != undefined;

        return line.symbolicOperands.map(symbolicOperand => {
            if (isLabel(symbolicOperand)) {
                return expandedLabel(line, symbolicOperand);
            }
            const parameterIndex = theMacro.parameters.indexOf(symbolicOperand);
            if (parameterIndex >= 0) {
                return `${actualParameters[parameterIndex]}`;
            }
            return symbolicOperand;
        });
    };

    const remapped = (line: LineWithProcessedMacro) =>
        line.macroName == "" ? line : lineWithRemappedMacro(
            line, remappedLabel(line), remappedParameters(line)
        );

    return {
        "useMacroMethod": useMacroMethod,
        "remapped": remapped
    };
};

export type Playback = ReturnType<typeof playback>;
