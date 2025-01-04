import type { NumericOperands } from "../operands/data-types.ts";
import type { Line } from "../pipeline/line.ts";
import type { LineWithPokedBytes } from "../program-memory/line-types.ts";
import type { Code } from "./data-types.ts";

export type LineWithObjectCode = Readonly<
    Pick<Line, keyof LineWithPokedBytes | "numericOperands">
>;

export const lineWithObjectCode = (
    line: LineWithPokedBytes, numeric: NumericOperands, code: Code
) => {
    (line as Line).numericOperands = numeric;
    if (code.length > 0) {
        (line as Line).code.push(code);
    }
    return line as LineWithObjectCode;
};
