import { emptyBag } from "../assembler/bags.ts";
import { bagOfFailures, clueFailure, type StringOrFailures } from "../failure/bags.ts";
import type { SymbolicOperand } from "../operands/data-types.ts";
import type { Label } from "../tokens/data-types.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import type { Macro, MacroList, MacroName, MacroParameters } from "./data-types.ts";
import { lineWithProcessedMacro, lineWithRemappedMacro } from "./line-types.ts";

export const remapping = (macroList: MacroList) => {
    const mapping: Map<string, MacroParameters> = new Map();

    const mapKey = (macroName: MacroName, macroCount: number) =>
        `${macroName}_${macroCount}`;

    const completed = (macroName: MacroName, macroCount: number) => {
        mapping.delete(mapKey(macroName, macroCount));
    };

    const prepared = (
        macroName: MacroName, macroCount: number,
        macro: Macro, actualParameters: MacroParameters
    ): StringOrFailures => {
        if (macro.parameters.length != actualParameters.length) {
            return bagOfFailures([
                clueFailure("macro_params", `${macro.parameters.length}`)
            ]);
        }
        mapping.set(mapKey(macroName, macroCount), actualParameters);
        return emptyBag();
    };

    const expandedLabel = (line: LineWithTokens, label: Label) =>
        `${line.macroName}$${line.macroCount}$${label}`;

    const remappedLabel = (line: LineWithTokens) =>
        line.label ? expandedLabel(line, line.label) : "";

    const remappedParameters = (line: LineWithTokens) => {
        const macro = macroList.get(line.macroName)!;
        const actual = mapping.get(mapKey(line.macroName, line.macroCount))!;

        const isLabel = (parameter: SymbolicOperand) =>
            macro.lines.find(line => line.label == parameter) != undefined;

        return line.symbolicOperands.map(symbolicOperand => {
            if (isLabel(symbolicOperand)) {
                return expandedLabel(line, symbolicOperand);
            }
            const parameterIndex = macro.parameters.indexOf(symbolicOperand);
            if (parameterIndex >= 0) {
                return `${actual[parameterIndex]}`;
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
        "prepared": prepared,
        "remapped": remapped,
        "completed": completed
    };
};

export type Remapping = ReturnType<typeof remapping>;
