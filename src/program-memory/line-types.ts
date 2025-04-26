import type { ImmutableLine, MutableLine } from "../assembler/line.ts";
import type { LineWithObjectCode } from "../object-code/line-types.ts";

export interface LineWithAddress extends LineWithObjectCode {
    "address": ImmutableLine["address"];
};

export const lineWithAddress = (
    line: LineWithObjectCode, address: number
) => {
    (line as MutableLine).address = address;
    return line as ImmutableLine;
};
