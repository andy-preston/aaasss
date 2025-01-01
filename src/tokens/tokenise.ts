import { failure, type Failures } from "../failure/failures.ts";
import {
OperandIndex,
    operands, type SymbolicOperand, type SymbolicOperands
} from "../operands/data-types.ts"
import type { LineWithRenderedJavascript } from "../source-code/line-types.ts";
import { indexOffsetOperands } from "./index-offset-operands.ts";
import { lineWithTokens } from "./line-types.ts";

const validLabel = /^\w*$/;
const anyWhitespace = /\s+/g;
const comment = /;.*$/;
const registerName = /^r\d{1,2}$/;
const indexRegisterName = /^[xyz]$/;

const isRegister = (operand: SymbolicOperand) =>
    operand.match(registerName) != null
        || operand.match(indexRegisterName) != null;

const splitOperands = (text: string): Array<string> =>
    text == "" ? [] : text.split(",").map(operand => operand.trim());

const split = (
    keep: "before" | "after", marker: string, raw: string
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

export const tokenise = (theLine: LineWithRenderedJavascript) => {
    const failures: Failures = [];

    const cleaned = theLine.assemblySource.replace(
        comment, ""
    ).replace(
        anyWhitespace, " "
    ).trim();

    const [label, withoutLabel] = split("after", ":", cleaned);
    if (!validLabel.test(label)) {
        failures.push(failure(undefined, "syntax_invalidLabel", undefined));
    }

    const [mnemonic, operandsText] = split("before", " ", withoutLabel);

    const operandsList = splitOperands(operandsText);

    if (operandsList.length > 2) {
        failures.push(failure(
            undefined, "operand_wrongCount", `${operandsList.length}`
        ));
    }

    const expandedOperands = indexOffsetOperands(operandsList.slice(0, 2));
    if (expandedOperands.length > 3) {
        failures.push(failure(1, "operand_tooManyIndexOffset", undefined));
    }

    const mappedOperands = expandedOperands.slice(0, 3).map(
        operand => isRegister(operand) ? operand.toUpperCase() : operand
    );

    for (const [index, operand] of mappedOperands.entries()) {
        if (operand == "") {
            failures.push(failure(index as OperandIndex, "operand_blank", ""));
        }
    }

    return lineWithTokens(
        theLine, label, mnemonic.toUpperCase(),
        operands<SymbolicOperands>(mappedOperands),
        failures
    );
};

export type Tokenise = typeof tokenise;
