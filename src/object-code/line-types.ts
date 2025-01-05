import type { LineWithOperands } from "../operands/line-types.ts";
import type { Line } from "../pipeline/line.ts";
import type { Code } from "./data-types.ts";

export type LineWithPokedBytes = Readonly<Pick<
    Line, keyof LineWithOperands | "code"
>>;

export const lineWithPokedBytes = (
    line: LineWithOperands, poked: Array<Code>
) => {
    (line as Line).code = poked;
    return line as LineWithPokedBytes;
};

export type LineWithObjectCode = Readonly<Pick<
    Line, keyof LineWithPokedBytes
>>;

export const lineWithObjectCode = (line: LineWithPokedBytes, code: Code) => {
    if (code.length > 0) {
        (line as Line).code.push(code);
    }
    return line as LineWithObjectCode;
};
