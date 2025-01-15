import type { Line } from "../assembler/line.ts";
import { LineWithProcessedMacro } from "../macro/line-types.ts";
import type { NumericOperands, OperandTypes } from "./data-types.ts";

export type LineWithOperands = Readonly<Pick<
    Line, keyof LineWithProcessedMacro | "numericOperands" | "operandTypes"
>>;

export const lineWithOperands = (
    line: LineWithProcessedMacro, operands: NumericOperands, types: OperandTypes
) => {
    (line as Line).numericOperands = operands;
    (line as Line).operandTypes = types;
    return line as LineWithOperands;
};
