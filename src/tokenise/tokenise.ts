import {
    operands, tokenisedLine, tokenisedFailures,
    type AssemblyLine, type SymbolicOperands, type TokenisedLine
} from "../pipeline/line.ts";

import { failure, type Failures } from "../value-or-failure.ts";

import { indexOffsetOperands } from "./index-offset-operands.ts";

const stripComment = (raw: string): string => {
    const semicolon = raw.indexOf(";");
    return semicolon == -1 ? raw : raw.substring(0, semicolon);
};

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

    const cleaned = stripComment(
        theLine.assemblySource
    ).replace(/\s+/g, " ").trim();

    const [label, withoutLabel] = split("after", ":", cleaned);
    if (label.indexOf(" ") != -1) {
        failures.push(failure(undefined, "syntax.spaceInLabel", undefined));
    }

    const [mnemonic, operandsText] = split("before", " ", withoutLabel);

    const operandsList = split("before", ",", operandsText).filter(
        (operand: string) => operand != ""
    );

    const expandedOperands = indexOffsetOperands(operandsList);
    if (expandedOperands.length > 3) {
        failures.push(failure(1, "operand.tooManyIndexOffset", undefined));
    }

    return failures.length > 0
        ? tokenisedFailures(theLine, failures)
        : tokenisedLine(
            theLine,
            label,
            mnemonic.toUpperCase(),
            operands<SymbolicOperands>(expandedOperands)
        );
};
