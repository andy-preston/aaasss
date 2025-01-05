import type { NumericOperands } from "../../operands/data-types.ts";
import type { Line } from "../../pipeline/line.ts";
import type { LineWithAddress } from "../../program-memory/line-types.ts";

export type LineWithOperands = Readonly<Pick<
    Line, keyof LineWithAddress | "numericOperands"
>>;

export const lineWithOperands = (
    line: LineWithAddress, operands: NumericOperands
) => {
    (line as Line).numericOperands = operands;
    return line as LineWithOperands;
};
