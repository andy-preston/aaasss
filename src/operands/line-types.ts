import type { ImmutableLine, MutableLine } from "../assembler/line.ts";
import type { LineWithProcessedMacro } from "../macros/line-types.ts";
import type { NumericOperands, OperandTypes } from "./data-types.ts";

export interface LineWithOperands extends LineWithProcessedMacro {
    "numericOperands": ImmutableLine["numericOperands"];
    "operandTypes": ImmutableLine["operandTypes"];
};

export const lineWithOperands = (
    line: LineWithProcessedMacro, operands: NumericOperands, types: OperandTypes
) => {
    (line as MutableLine).numericOperands = operands;
    (line as MutableLine).operandTypes = types;
    return line as ImmutableLine;
};
