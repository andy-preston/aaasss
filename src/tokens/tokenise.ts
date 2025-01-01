import { failure, type Failures } from "../failure/failures.ts";
import {
    operands, type OperandIndex, type SymbolicOperands
} from "../operands/data-types.ts"
import type { LineWithRenderedJavascript } from "../source-code/line-types.ts";
import { clean } from "./clean.ts";
import { indexRegisterWithPlus } from "./index-offset.ts";
import { invalidLabel } from "./invalid-label.ts";
import { lineWithTokens } from "./line-types.ts";
import { splitOperands } from "./split-operands.ts";
import { splitSource } from "./split-source.ts";
import { upperCaseRegisters } from "./upper-case-registers.ts";

export const tokenise = (line: LineWithRenderedJavascript) => {
    const failures: Failures = [];

    const cleaned = clean(line.assemblySource);

    const [label, withoutLabel] = splitSource("after", ":", cleaned);
    if (invalidLabel(label)) {
        failures.push(failure(undefined, "syntax_invalidLabel", undefined));
    }

    const [mnemonic, operandsText] = splitSource("before", " ", withoutLabel);

    const operandsList = splitOperands(operandsText);
    if (operandsList.length > 2) {
        failures.push(failure(
            undefined, "operand_wrongCount", `${operandsList.length}`
        ));
    }

    const fullOperands: Array<string> = [];
    for (const operand of operandsList.slice(0, 2)) {
        const indexing = indexRegisterWithPlus(operand);
        if (indexing == "") {
            fullOperands.push(operand);
        } else if (indexing == "X+") {
            failures.push(failure(
                fullOperands.length as OperandIndex, "operand_offsetX", ""
            ));
            fullOperands.push(operand);
        } else if (fullOperands.length == 0 && mnemonic != "STD") {
            failures.push(failure(
                fullOperands.length as OperandIndex, "operand_offsetNotStd", ""
            ));
            fullOperands.push(operand);
        } else if (fullOperands.length == 1 && mnemonic != "LDD") {
            failures.push(failure(
                fullOperands.length as OperandIndex, "operand_offsetNotLdd", ""
            ));
            fullOperands.push(operand);
        } else {
            fullOperands.push(indexing);
            fullOperands.push(operand.substring(2));
        }
    }

    for (const [index, operand] of fullOperands.entries()) {
        if (operand == "") {
            failures.push(failure(index as OperandIndex, "operand_blank", ""));
        }
    }

    const mappedOperands = fullOperands.map(upperCaseRegisters);

    return lineWithTokens(
        line, label, mnemonic.toUpperCase(),
        operands<SymbolicOperands>(mappedOperands),
        failures
    );
};

export type Tokenise = typeof tokenise;
