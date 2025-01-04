import { failure } from "../failure/failures.ts";
import { SymbolicOperand } from "../operands/data-types.ts";
import { operands, SymbolicOperands } from "../operands/data-types.ts";
import { Label } from "../source-code/data-types.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";
import { lineWithExpandedMacro } from "./line-types.ts";

export type MacroName = string;
export type SymbolicParameters = Array<string>;
export type ActualParameters = Array<string | number>;

export const macro = (name: MacroName, symbolic: SymbolicParameters) => {

    const lines: Array<LineWithTokens> = [];
    let instance = 0;

    const mapLabel = (label: Label) =>
        label ? `${name}$${instance}$${label}` : "";

    const isLabel = (parameter: SymbolicOperand) =>
        lines.find(line => line.label == parameter) != undefined;

    const mapper = (actual: ActualParameters) => {
        const mapOperand = (oldOperand: SymbolicOperand) => {
            const newOperand = isLabel(oldOperand)
                ? mapLabel(oldOperand)
                : actual[symbolic.indexOf(oldOperand)];
            return newOperand == undefined ? oldOperand : `${newOperand}`;
        };

        return function* (callingLine: LineWithTokens) {
            instance = instance + 1;
            for (const [index, line] of lines.entries()) {
                const symbolicOperands = line.symbolicOperands.map(mapOperand);
                const expandedLine = lineWithExpandedMacro(
                    callingLine,
                    line,
                    mapLabel(line.label),
                    operands<SymbolicOperands>(symbolicOperands)
                );
                if (index == 0 && symbolic.length != actual.length) {
                    expandedLine.withFailure(
                        failure(undefined, "macro_params", `${actual.length}`)
                    );
                }
                yield expandedLine;
            }
        };
    };

    return {
        "push": (line: LineWithTokens) => lines.push(line),
        "empty": () => lines.length == 0,
        "mapper": mapper
    }
};

export type Macro = Readonly<ReturnType<typeof macro>>;
export type MacroMapper = ReturnType<Macro["mapper"]>;
