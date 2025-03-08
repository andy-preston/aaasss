import { failure } from "../failure/bags.ts";
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
        line.withFailure(failure(undefined, "syntax_invalidLabel", undefined));
    }

    const [mnemonic, operandsText] = splitSource("before", " ", withoutLabel);

    const operandsList = splitOperands(operandsText);
    if (operandsList.length > 2) {
        line.withFailure(failure(
            undefined, "operand_wrongCount", [`${operandsList.length}`]
        ));
    }

    const fullOperands: Array<string> = [];
    for (const operand of operandsList.slice(0, 2)) {
        const indexing = indexRegisterWithPlus(operand);
        if (indexing == "") {
            fullOperands.push(operand);
        } else if (indexing == "X+") {
            line.withFailure(failure(
                fullOperands.length as OperandIndex, "operand_offsetX", undefined
            ));
            fullOperands.push(operand);
        } else if (fullOperands.length == 0 && mnemonic != "STD") {
            line.withFailure(failure(
                fullOperands.length as OperandIndex, "operand_offsetNotStd", undefined
            ));
            fullOperands.push(operand);
        } else if (fullOperands.length == 1 && mnemonic != "LDD") {
            line.withFailure(failure(
                fullOperands.length as OperandIndex, "operand_offsetNotLdd", undefined
            ));
            fullOperands.push(operand);
        } else {
            fullOperands.push(indexing);
            fullOperands.push(operand.substring(2));
        }
    }

    for (const [index, operand] of fullOperands.entries()) {
        if (operand == "") {
            line.withFailure(failure(index as OperandIndex, "operand_blank", undefined));
        }
    }

    const mappedOperands = fullOperands.map(upperCaseRegisters);

    return lineWithTokens(
        line, label, mnemonic.toUpperCase(),
        operands<SymbolicOperands>(mappedOperands)
    );
};

export type Tokenise = typeof tokenise;
