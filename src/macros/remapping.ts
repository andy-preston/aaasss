import { parameterList } from "../directives/type-checking.ts";
import { emptyBox, failure } from "../failure/failure-or-box.ts";
import type { SymbolicOperand } from "../operands/data-types.ts";
import type { Label } from "../tokens/data-types.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import type { Macro, MacroList, MacroName, MacroParameters } from "./data-types.ts";
import { lineWithProcessedMacro, lineWithRemappedMacro } from "./line-types.ts";

export const remapping = (macros: MacroList) => {
    const parameterMap: Map<MacroName, MacroParameters> = new Map([]);

    const parameterSetup = (
        macroName: MacroName, macro: Macro, actualParameters: MacroParameters
    ) => {
        const checkedParameters = parameterList(
            actualParameters, "type_macroParams"
        );
        if (checkedParameters.which == "failure") {
            return checkedParameters;
        }
        if (macro.parameters.length != actualParameters.length) {
            return failure(
                undefined, "macro_params", [`${macro.parameters.length}`]
            );
        }
        parameterMap.set(
            macroName,
            checkedParameters.value == "undefined" ? [] : actualParameters
        );
        return emptyBox();
    };

    const expandedLabel = (line: LineWithTokens, label: Label) =>
        `${line.macroName}$${line.macroCount}$${label}`;

    const remappedLabel = (line: LineWithTokens) =>
        line.label ? expandedLabel(line, line.label) : "";

    const remappedParameters = (line: LineWithTokens) => {
        const macro = macros.get(line.macroName)!;
        const actualParameters = parameterMap.get(line.macroName)!;

        const isLabel = (parameter: SymbolicOperand) =>
            macro.lines.find(line => line.label == parameter) != undefined;

        return line.symbolicOperands.map(symbolicOperand => {
            if (isLabel(symbolicOperand)) {
                return expandedLabel(line, symbolicOperand);
            }
            const parameterIndex = macro.parameters.indexOf(symbolicOperand);
            if (parameterIndex >= 0) {
                return `${actualParameters[parameterIndex]}`;
            }
            return symbolicOperand;
        });
    };

    const remapped = (line: LineWithTokens) => line.macroName == ""
        ? lineWithProcessedMacro(line, false)
        : lineWithRemappedMacro(
            line, remappedLabel(line), remappedParameters(line)
        );

    return {
        "parameterSetup": parameterSetup,
        "remapped": remapped
    };
};

export type Remapping = ReturnType<typeof remapping>;
