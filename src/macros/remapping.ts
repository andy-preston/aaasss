import type { Failure } from "../failure/bags.ts";
import type { Line } from "../line/line-types.ts";
import type { Operand } from "../operands/data-types.ts";
import type { FileLineIterator } from "../source-code/data-types.ts";
import type { Label } from "../tokens/data-types.ts";
import type { Macro, MacroList, MacroName, MacroParameters } from "./data-types.ts";

import { assertionFailure } from "../failure/bags.ts";

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
    ): Failure | undefined => {
        if (macro.parameters.length != actualParameters.length) {
            return assertionFailure(
                "macro_params",
                `${macro.parameters.length}`, `${actualParameters.length}`
            );
        }
        mapping.set(mapKey(macroName, macroCount), actualParameters);
        return;
    };

    const expandedLabel = (line: Line, label: Label) =>
        `${line.macroName}$${line.macroCount}$${label}`;

    const remappedLabel = (line: Line) =>
        line.label ? expandedLabel(line, line.label) : "";

    const remappedOperands = (line: Line) => {
        const macro = macroList.get(line.macroName)!;
        const actual = mapping.get(mapKey(line.macroName, line.macroCount))!;

        const isLabel = (operand: Operand) =>
            macro.lines.find(line => line.label == operand) != undefined;

        return line.operands.map(operand => {
            if (isLabel(operand)) {
                return expandedLabel(line, operand);
            }
            const parameterIndex = macro.parameters.indexOf(operand);
            if (parameterIndex >= 0) {
                return `${actual[parameterIndex]}`;
            }
            return operand;
        });
    };

    const remapped = (line: Line) => {
        if (line.macroName !== "") {
            line.label = remappedLabel(line);
            line.operands = remappedOperands(line);
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
