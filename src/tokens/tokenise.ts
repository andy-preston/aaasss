import { boringFailure, clueFailure } from "../failure/bags.ts";
import type { LineWithRenderedJavascript } from "../javascript/line-types.ts";
import { operands, type OperandIndex, type SymbolicOperands } from "../operands/data-types.ts"
import { indexOffsetRules } from "./index-offset.ts";
import { lineWithTokens } from "./line-types.ts";
import { splitSource } from "./split-source.ts";
import { upperCaseRegisters } from "./upper-case-registers.ts";

const anyWhitespace = /\s+/g;
const comment = /;.*$/;

const clean = (sourceLine: string) =>
    sourceLine.replace(comment, "").replace(anyWhitespace, " ").trim();

const validLabel = /^\w*$/;

const invalidLabel = (label: string) => !validLabel.test(label);

const splitOperands = (text: string): Array<string> =>
    text == "" ? [] : text.split(",").map(operand => operand.trim());

export const tokenise = (line: LineWithRenderedJavascript) => {
    const cleaned = clean(line.assemblySource);

    const [label, withoutLabel] = splitSource("after", ":", cleaned);
    if (invalidLabel(label)) {
        line.withFailure(boringFailure("syntax_invalidLabel"));
    }

    const [mnemonic, operandsText] = splitSource("before", " ", withoutLabel);

    const operandsList = splitOperands(operandsText);
    if (operandsList.length > 2) {
        line.withFailure(
            clueFailure("operand_count", `${operandsList.length}`)
        );
    }

    const fullOperands: Array<string> = [];

    operandsList.slice(0, 2).forEach(operand => {
        indexOffsetRules(operand, mnemonic, fullOperands, line);
    });

    fullOperands.forEach((operand, index) => {
        if (operand == "") {
            const failure = boringFailure("operand_blank");
            failure.location = {"operand": index as OperandIndex};
            line.withFailure(failure);
        }
    });

    const mappedOperands = fullOperands.map(upperCaseRegisters);

    return lineWithTokens(
        line, label, mnemonic.toUpperCase(),
        operands<SymbolicOperands>(mappedOperands)
    );
};

export type Tokenise = typeof tokenise;
