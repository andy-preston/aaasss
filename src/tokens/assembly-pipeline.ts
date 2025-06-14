import type { PipelineStage } from "../assembler/data-types.ts";
import type { Line } from "../line/line-types.ts";

import { assertionFailure, boringFailure } from "../failure/bags.ts";
import { pushOperandCheckingIndexOffset } from "./index-offset.ts";
import { splitSource } from "./split-source.ts";
import { upperCaseRegisters } from "./upper-case-registers.ts";

const anyWhitespace = /\s+/g;
const comment = /;.*$/;
const validLabel = /^\w*$/;

const clean = (sourceLine: string) =>
    sourceLine.replace(comment, "").replace(anyWhitespace, " ").trim();

const invalidLabel = (label: string) => !validLabel.test(label);

const splitOperands = (text: string): Array<string> =>
    text == "" ? [] : text.split(",").map(operand => operand.trim());

export const tokens: PipelineStage = (line: Line) => {
    const cleaned = clean(line.assemblySource);

    const [label, withoutLabel] = splitSource("after", ":", cleaned);
    if (invalidLabel(label)) {
        line.failures.push(boringFailure("syntax_invalidLabel"));
    }

    const mnemonicAndOperands = splitSource("before", " ", withoutLabel);
    const mnemonic = mnemonicAndOperands[0].toUpperCase();
    const operandsText = mnemonicAndOperands[1];

    if (mnemonic != "" && !mnemonic.match("^[A-Z]+$")) {
        line.failures.push(boringFailure("syntax_invalidMnemonic"));
    }

    const operandsList = splitOperands(operandsText);
    if (operandsList.length > 2) {
        line.failures.push(assertionFailure(
            "operand_count", "2", `${operandsList.length}`
        ));
    }

    const fullOperands: Array<string> = [];

    operandsList.slice(0, 2).forEach(operand => {
        pushOperandCheckingIndexOffset(operand, mnemonic, fullOperands, line);
    });

    fullOperands.forEach((operand, index) => {
        if (operand == "") {
            const failure = boringFailure("operand_blank");
            failure.location = {"operand": index};
            line.failures.push(failure);
        }
    });

    line.symbolicOperands = fullOperands.map(upperCaseRegisters);
    line.label = label;
    line.mnemonic = mnemonic;
};
