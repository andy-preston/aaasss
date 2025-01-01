import { failure, type Failures } from "../failure/failures.ts";
import {
    operands, type OperandIndex, type SymbolicOperands
} from "../operands/data-types.ts"
import type { LineWithRenderedJavascript } from "../source-code/line-types.ts";
import { clean } from "./clean.ts";
import { indexOffsetOperands } from "./index-offset-operands.ts";
import { invalidLabel } from "./invalid-label.ts";
import { lineWithTokens } from "./line-types.ts";
import { splitOperands } from "./split-operands.ts";
import { splitSource } from "./split-source.ts";
import { upperCaseRegisters } from "./upper-case-registers.ts";

export const tokenise = (theLine: LineWithRenderedJavascript) => {
    const failures: Failures = [];

    const cleaned = clean(theLine.assemblySource);

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

    const expandedOperands = indexOffsetOperands(operandsList.slice(0, 2));
    if (expandedOperands.length > 3) {
        failures.push(failure(1, "operand_tooManyIndexOffset", undefined));
    }

    const mappedOperands = expandedOperands.slice(0, 3).map(upperCaseRegisters);

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
