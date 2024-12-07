import { failure, type Failures } from "../coupling/value-failure.ts";
import { operands, type SymbolicOperands } from "../operands/data-types.ts"
import type { AssemblyLine } from "../source-code/line-types.ts";
import { indexOffsetOperands } from "./index-offset-operands.ts";
import { tokenisedLine, TokenisedLine } from "./tokenised-line.ts";

const validLabel = /^\w*$/;
const anyWhitespace = /\s+/g;
const comment = /;.*$/;

const split = (
    keep: "before" | "after",
    marker: string,
    raw: string
): [string, string] => {
    const position = raw.indexOf(marker);
    if (position == -1) {
        return keep == "before" ? [raw.trim(), ""] : ["", raw.trim()];
    }
    return [
        raw.substring(0, position).trim(),
        raw.substring(position + 1).trim()
    ];
};

export const tokenise = (theLine: AssemblyLine): TokenisedLine => {
    const failures: Failures = [];

    const cleaned = theLine.assemblySource.replace(
        comment, ""
    ).replace(
        anyWhitespace, " "
    ).trim();

    const [label, withoutLabel] = split("after", ":", cleaned);
    if (!validLabel.test(label)) {
        failures.push(failure(undefined, "syntax.invalidLabel", undefined));
    }

    const [mnemonic, operandsText] = split("before", " ", withoutLabel);

    const operandsList = split("before", ",", operandsText).filter(
        (operand: string) => operand != ""
    );

    const expandedOperands = indexOffsetOperands(operandsList);
    if (expandedOperands.length > 3) {
        failures.push(failure(1, "operand.tooManyIndexOffset", undefined));
    }

    return tokenisedLine(
        theLine,
        label,
        mnemonic.toUpperCase(),
        operands<SymbolicOperands>(
            expandedOperands.length > 3 ? operandsList : expandedOperands
        ),
        failures
    );
};

export type Tokenise = typeof tokenise;
