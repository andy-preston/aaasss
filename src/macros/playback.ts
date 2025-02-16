import { parameterList } from "../directives/type-checking.ts";
import { emptyBox, failure } from "../failure/failure-or-box.ts";
import type { SymbolicOperand } from "../operands/data-types.ts";
import type { Label } from "../tokens/data-types.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import type { ActualParameters, MacroList, MacroName } from "./data-types.ts";
import { lineWithProcessedMacro, lineWithRemappedMacro } from "./line-types.ts";


export const playback = (macros: MacroList) => {

    const parameterMap: Map<MacroName, ActualParameters> = new Map([]);

    const parameterSetup = (
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

export type Playback = ReturnType<typeof playback>;
