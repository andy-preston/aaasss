import type { ImmutableLine, MutableLine } from "../assembler/line-types.ts";
import type { LineWithOperands } from "../operands/line-types.ts";
import type { Code } from "./data-types.ts";

export interface LineWithPokedBytes extends LineWithOperands {
    "code": ImmutableLine["code"];
};

export const lineWithPokedBytes = (
    line: LineWithOperands, poked: Array<Code>
) => {
    (line as MutableLine).code = [...poked];
    return line as ImmutableLine;
};

export interface LineWithObjectCode extends LineWithPokedBytes {
};

export const lineWithObjectCode = (line: LineWithPokedBytes, code: Code) => {
    if (code.length > 0) {
        (line as MutableLine).code.push(code);
    }
    return line as ImmutableLine;
};
