import type { LineWithProcessedMacro } from "../macro/line-types.ts";
import type { Line } from "../pipeline/line.ts";
import type { Code } from "../object-code/data-types.ts";
import { LineWithOperands } from "../javascript/operands/line-types.ts";

export type LineWithAddress = Readonly<Pick<
    Line, keyof LineWithProcessedMacro | "address"
>>;

export const lineWithAddress = (
    line: LineWithProcessedMacro, address: number
) => {
    (line as Line).address = address;
    return line as LineWithAddress;
};

export type LineWithPokedBytes = Readonly<Pick<
    Line, keyof LineWithOperands | "code"
>>;

export const lineWithPokedBytes = (
    line: LineWithOperands, poked: Array<Code>
) => {
    (line as Line).code = poked;
    return line as LineWithPokedBytes;
};
