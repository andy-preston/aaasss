import { SymbolicOperand } from "../pipeline/line.ts";

const match = (operand: SymbolicOperand): Array<string> => {
    const prefix = operand.toUpperCase().match(/^[Y|Z]\+/);
    if (prefix == null) {
        return [];
    }
    const suffix = operand.substring(2);
    return isNaN(suffix as unknown as number) ? [] : [prefix[0], suffix];
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
