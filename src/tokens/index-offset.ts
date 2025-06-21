import type { Line } from "../line/line-types.ts";
import type { Mnemonic } from "./data-types.ts";

import { addFailure } from "../failure/add-failure.ts";
import { boringFailure } from "../failure/bags.ts";

const pattern = /^[XYZ]\+/;

const indexRegisterWithPlus = (operand: string) => {
    const match = operand.toUpperCase().match(pattern);
    return match == null ? "" : match[0];
};

export const pushOperandCheckingIndexOffset = (
    operand: string, mnemonic: Mnemonic, fullOperands: Array<string>, line: Line
) => {
    const operandPositionIs = (position: number) =>
        fullOperands.length == position;

    const indexing = indexRegisterWithPlus(operand);
    if (indexing == "" || indexing == operand) {
        fullOperands.push(operand);
        return;
    }

    if (indexing == "X+") {
        const failure = boringFailure("operand_offsetX");
        failure.location = {"operand": fullOperands.length};
        addFailure(line.failures, failure);
        fullOperands.push(operand);
        return;
    }

    if (operandPositionIs(0) && mnemonic != "STD") {
        const failure = boringFailure("operand_offsetNotStd");
        failure.location = {"operand": fullOperands.length};
        addFailure(line.failures, failure);
        fullOperands.push(operand);
        return;
    }

    if (operandPositionIs(1) && mnemonic != "LDD") {
        const failure = boringFailure("operand_offsetNotLdd");
        failure.location = {"operand": fullOperands.length};
        addFailure(line.failures, failure);
        fullOperands.push(operand);
        return;
    }

    fullOperands.push(indexing);
    fullOperands.push(operand.substring(2));
};
