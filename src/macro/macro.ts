import { failure } from "../coupling/value-failure.ts";
import { SymbolicOperand } from "../operands/data-types.ts";
import { operands, SymbolicOperands } from "../operands/data-types.ts";
import { Label } from "../source-code/data-types.ts";
import type { TokenisedLine } from "../tokenise/tokenised-line.ts";
import { mappedExpandedLine } from "./line-types.ts";

export type MacroName = string;
export type SymbolicParameters = Array<string>;
export type ActualParameters = Array<string | number>;

export const macro = (name: MacroName, symbolic: SymbolicParameters) => {

    const lines: Array<TokenisedLine> = [];
    let instance = 0;

    const mapLabel = (label: Label) =>
        label ? `${name}$${instance}$${label}` : "";

    const isLabel = (parameter: SymbolicOperand) =>
        lines.find(line => line.label == parameter) != undefined;

    const mapper = (actual: ActualParameters) => {
        const parameterFailure = (firstLine: boolean) =>
            firstLine && symbolic.length != actual.length
                ? [failure(undefined, "macro.params", `${actual.length}`)]
                : [];

        const mapOperand = (oldOperand: SymbolicOperand) => {
            const newOperand = isLabel(oldOperand)
                ? mapLabel(oldOperand)
                : actual[symbolic.indexOf(oldOperand)];
            return newOperand == undefined ? oldOperand : `${newOperand}`;
        };

        return function* (callingLine: TokenisedLine) {
            instance = instance + 1;
            for (const [index, line] of lines.entries()) {
                const symbolicOperands = line.symbolicOperands.map(mapOperand);
                yield mappedExpandedLine(
                    callingLine,
                    line,
                    mapLabel(line.label),
                    operands<SymbolicOperands>(symbolicOperands),
                    parameterFailure(index == 0)
                );
            }
        };
    };

    return {
        "push": (line: TokenisedLine) => lines.push(line),
        "empty": () => lines.length == 0,
        "mapper": mapper
    }
};

export type Macro = Readonly<ReturnType<typeof macro>>;
export type MacroMapper = ReturnType<Macro["mapper"]>;
