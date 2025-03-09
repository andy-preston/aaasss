import { boringFailure, oldFailure } from "../failure/bags.ts";
import {
    operands, type OperandIndex, type SymbolicOperands
} from "../operands/data-types.ts"
import type { LineWithRenderedJavascript } from "../javascript/line-types.ts";
import { clean } from "./clean.ts";
import { indexRegisterWithPlus } from "./index-offset.ts";
import { invalidLabel } from "./invalid-label.ts";
import { lineWithTokens } from "./line-types.ts";
import { splitOperands } from "./split-operands.ts";
import { splitSource } from "./split-source.ts";
import { upperCaseRegisters } from "./upper-case-registers.ts";

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
            oldFailure("operand_wrongCount", [`${operandsList.length}`])
        );
    }

    const fullOperands: Array<string> = [];
    for (const operand of operandsList.slice(0, 2)) {
        const indexing = indexRegisterWithPlus(operand);
        if (indexing == "") {
            fullOperands.push(operand);
        } else if (indexing == "X+") {
            const failure = oldFailure("operand_offsetX", undefined);
            failure.operand = fullOperands.length as OperandIndex;
            line.withFailure(failure);
            fullOperands.push(operand);
        } else if (fullOperands.length == 0 && mnemonic != "STD") {
            const failure = oldFailure("operand_offsetNotStd", undefined);
            failure.operand = fullOperands.length as OperandIndex;
            line.withFailure(failure);
            fullOperands.push(operand);
        } else if (fullOperands.length == 1 && mnemonic != "LDD") {
            const failure = oldFailure("operand_offsetNotLdd", undefined);
            failure.operand = fullOperands.length as OperandIndex;
            line.withFailure(failure);
            fullOperands.push(operand);
        } else {
            fullOperands.push(indexing);
            fullOperands.push(operand.substring(2));
        }
    }

    for (const [index, operand] of fullOperands.entries()) {
        if (operand == "") {
            const failure = oldFailure("operand_blank", undefined);
            failure.operand = index as OperandIndex;
            line.withFailure(failure);
        }
    }

    const mappedOperands = fullOperands.map(upperCaseRegisters);

    return lineWithTokens(
        line, label, mnemonic.toUpperCase(),
        operands<SymbolicOperands>(mappedOperands)
    );
};

export type Tokenise = typeof tokenise;
