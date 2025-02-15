import { parameterList } from "../directives/type-checking.ts";
import { emptyBox, failure, type Box, type Failure } from "../failure/failure-or-box.ts";
import { FileLineIterator, FileStack } from "../source-code/file-stack.ts";
import { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { ActualParameters, Macro, MacroList, MacroName } from "./data-types.ts";
import { labelsAndOperands } from "./labels-operands.ts";

export type MacroInvocation = (
    ...parameters: ActualParameters
) => Box<undefined> | Failure;

export const playback = (
    macros: MacroList, symbolTable: SymbolTable, fileStack: FileStack
) => {

    function* imaginaryFile(
        macroName: string, theMacro: Macro, withParameters: ActualParameters
    ): FileLineIterator {

        const labelPrefix = () => {
            const count = symbolTable.count(macroName);
            return `${macroName}$${count}$`;
        };

        const map = labelsAndOperands(theMacro, labelPrefix(), withParameters!);

        for (const line of theMacro.lines) {
            const mangledSourceCode: Array<string> = [];
            if (line.label) {
                mangledSourceCode.push(`${map.label(line.label)}:`);
            }
            if (line.mnemonic) {
                mangledSourceCode.push(line.mnemonic);
            }
            const symbolicOperands = line.symbolicOperands.map(map.operand);
            if (symbolicOperands.length > 0) {
                mangledSourceCode.push(symbolicOperands.join(", "));
            }
            yield [mangledSourceCode.join(" "), false];
        }
    };

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
        fileStack.pushImaginary(imaginaryFile(
            macroName,
            theMacro,
            checkedParameters.value == "undefined" ? [] : actualParameters
        ));
        return emptyBox();
    };

    return useMacroMethod;
};

export type Playback = ReturnType<typeof playback>;
