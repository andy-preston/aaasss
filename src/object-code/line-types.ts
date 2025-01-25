import type { ImmutableLine, MutableLine } from "../assembler/line.ts";
import { LineWithOperands } from "../operands/line-types.ts";
import type { Code } from "./data-types.ts";

export type LineWithPokedBytes = Readonly<Pick<
    ImmutableLine, keyof LineWithOperands | "code"
>>;

export const lineWithPokedBytes = (
    line: LineWithOperands, poked: Array<Code>
) => {
    (line as MutableLine).code = poked;
    return line as LineWithPokedBytes;
};

export type LineWithObjectCode = Readonly<Pick<
    ImmutableLine, keyof LineWithPokedBytes
>>;

export const lineWithObjectCode = (line: LineWithPokedBytes, code: Code) => {
    if (code.length > 0) {
        (line as MutableLine).code.push(code);
    }
    return line as LineWithObjectCode;
};
