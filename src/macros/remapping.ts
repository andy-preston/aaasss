import type { StringOrFailures } from "../failure/bags.ts";
import type { Line } from "../line/line-types.ts";
import type { SymbolicOperand } from "../operands/data-types.ts";
import type { FileLineIterator } from "../source-code/data-types.ts";
import type { Label } from "../tokens/data-types.ts";
import type { Macro, MacroList, MacroName, MacroParameters } from "./data-types.ts";

import { emptyBag } from "../assembler/bags.ts";
import { assertionFailure, bagOfFailures } from "../failure/bags.ts";

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
            return bagOfFailures([assertionFailure(
                "macro_params",
                `${macro.parameters.length}`, `${actualParameters.length}`
            )]);
        }
        mapping.set(mapKey(macroName, macroCount), actualParameters);
        return emptyBag();
    };

    const expandedLabel = (line: Line, label: Label) =>
        `${line.macroName}$${line.macroCount}$${label}`;

    const remappedLabel = (line: Line) =>
        line.label ? expandedLabel(line, line.label) : "";

    const remappedOperands = (line: Line) => {
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

    const remapped = (line: Line) => {
        line.isDefiningMacro = false;
        if (line.macroName !== "") {
            line.label = remappedLabel(line);
            line.symbolicOperands = remappedOperands(line);
        }
    };

    const imaginaryFile = function* (
        macroName: string, macroCount: number
    ): FileLineIterator {
        for (const line of macroList.get(macroName)!.lines) {
            yield [line.rawSource, macroName, macroCount!, false];
        }
        completed(macroName, macroCount);
    };

    return {
        "prepared": prepared,
        "remapped": remapped,
        "imaginaryFile": imaginaryFile
    };
};

export type Remapping = ReturnType<typeof remapping>;
