import type { Failure } from "../failure/bags.ts";
import type { Line } from "../line/line-types.ts";
import type { OperandIndex } from "../operands/data-types.ts";
import type { Mnemonic } from "./data-types.ts";

import { boringFailure } from "../failure/bags.ts";

const pattern = /^[XYZ]\+/;

const indexRegisterWithPlus = (operand: string) => {
    const match = operand.toUpperCase().match(pattern);
    return match == null ? "" : match[0];
};

export const pushOperandCheckingIndexOffset = (
    operand: string, mnemonic: Mnemonic, fullOperands: Array<string>, line: Line
) => {
    const addFailure = (failure: Failure) => {
        failure.location = { "operand": fullOperands.length as OperandIndex };
        line.withFailures([failure]);
    };

    const operandPositionIs = (position: number) =>
        fullOperands.length == position;

    const indexing = indexRegisterWithPlus(operand);
    if (indexing == "" || indexing == operand) {
        fullOperands.push(operand);
        return;
    }

    if (indexing == "X+") {
        addFailure(boringFailure("operand_offsetX"));
        fullOperands.push(operand);
        return;
    }

    if (operandPositionIs(0) && mnemonic != "STD") {
        addFailure(boringFailure("operand_offsetNotStd"));
        fullOperands.push(operand);
        return;
    }

    if (operandPositionIs(1) && mnemonic != "LDD") {
        addFailure(boringFailure("operand_offsetNotLdd"));
        fullOperands.push(operand);
        return;
    }

    fullOperands.push(indexing);
    fullOperands.push(operand.substring(2));
};
