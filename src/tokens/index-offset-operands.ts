import { SymbolicOperand } from "../operands/data-types.ts";

const match = (operand: SymbolicOperand): Array<string> => {
    const indexRegisterWithPlus = operand.toUpperCase().match(/^[X|Y|Z]\+/);
    if (indexRegisterWithPlus == null) {
        return [];
    }
    const suffix = operand.substring(2);
    return isNaN(suffix as unknown as number) ? [] : [indexRegisterWithPlus[0], suffix];
};

export const indexOffsetOperands = (operands: Array<string>): Array<string> => {
    const result: Array<string> = [];
    for (const operand of operands) {
        const matches = match(operand);
        if (matches.length == 0) {
            result.push(operand);
        } else {
            result.push(...matches);
        }
    }
    return result;
};
