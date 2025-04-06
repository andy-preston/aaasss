import { boringFailure, type Failure } from "../failure/bags.ts";
import type { LineWithRenderedJavascript } from "../javascript/line-types.ts";
import type { OperandIndex } from "../operands/data-types.ts";
import type { Mnemonic } from "./data-types.ts";

const pattern = /^[XYZ]\+/;

const indexRegisterWithPlus = (operand: string) => {
    const match = operand.toUpperCase().match(pattern);
    return match == null ? "" : match[0];
};

export const indexOffsetRules = (
    operand: string,
    mnemonic: Mnemonic,
    fullOperands: Array<string>,
    line: LineWithRenderedJavascript
) => {
    const addFailure = (failure: Failure) => {
        failure.location = { "operand": fullOperands.length as OperandIndex };
        line.withFailure(failure);
    };

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

    if (fullOperands.length == 1 && !["LDD"/*, "LPM"*/].includes(mnemonic)) {
        addFailure(boringFailure("operand_offsetNotLdd"));
        fullOperands.push(operand);
        return;
    }

    fullOperands.push(indexing);
    fullOperands.push(operand.substring(2));
};
