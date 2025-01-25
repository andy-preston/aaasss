import type { SymbolicOperand } from "../operands/data-types.ts";
import type { Label } from "../source-code/data-types.ts";
import type { ActualParameters, Macro, MacroName } from "./data-types.ts";

export const labelsAndOperands = (
    macro: Macro, name: MacroName, actual: ActualParameters
) => {
    const count = macro.useCount();

    const isLabel = (parameter: SymbolicOperand) =>
        macro.lines.find(line => line.label == parameter) != undefined;

    const expandedLabel = (label: Label) =>
        label ? `${name}$${count}$${label}` : "";

    const definedParameterIndex = (parameter: string) =>
        macro.parameters.indexOf(parameter);

    const operand = (asDefined: SymbolicOperand) => {
        const actualOperand = isLabel(asDefined)
            ? expandedLabel(asDefined)
            : actual[definedParameterIndex(asDefined)];
        return actualOperand == undefined ? asDefined : `${actualOperand}`;
    };

    return {
        "operand": operand,
        "label": expandedLabel
    }
};
