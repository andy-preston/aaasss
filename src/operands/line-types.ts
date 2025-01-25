import type { MutableLine } from "../assembler/line.ts";
import { LineWithProcessedMacro } from "../macro/line-types.ts";
import type { NumericOperands, OperandTypes } from "./data-types.ts";

export type LineWithOperands = Readonly<Pick<
    MutableLine, keyof LineWithProcessedMacro | "numericOperands" | "operandTypes"
>>;

export const lineWithOperands = (
    line: LineWithProcessedMacro, operands: NumericOperands, types: OperandTypes
) => {
    (line as MutableLine).numericOperands = operands;
    (line as MutableLine).operandTypes = types;
    return line as LineWithOperands;
};
