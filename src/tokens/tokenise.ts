import { boringFailure, clueFailure, type Failure } from "../failure/bags.ts";
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
            clueFailure("operand_count", `${operandsList.length}`)
        );
    }

    const fullOperands: Array<string> = [];

    const addFailure = (failure: Failure) => {
        failure.location = {"operand": fullOperands.length as OperandIndex};
        line.withFailure(failure);
    };

    operandsList.slice(0, 2).forEach((operand) => {
        const indexing = indexRegisterWithPlus(operand);
        if (indexing == "") {
            fullOperands.push(operand);
            return;
        }

        if (indexing == "X+") {
            addFailure(boringFailure("operand_offsetX"));
            fullOperands.push(operand);
            return;
        }

        if (fullOperands.length == 0 && mnemonic != "STD") {
            addFailure(boringFailure("operand_offsetNotStd"));
            fullOperands.push(operand);
            return;
        }

        if (fullOperands.length == 1 && mnemonic != "LDD") {
            addFailure(boringFailure("operand_offsetNotLdd"));
            fullOperands.push(operand);
            return;
        }

        fullOperands.push(indexing);
        fullOperands.push(operand.substring(2));
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
