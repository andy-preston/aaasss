import type { ImmutableLine, MutableLine } from "../line/line-types.ts";
import type { LineWithRawSource } from "../source-code/line-types.ts";

export interface LineWithAddress extends LineWithRawSource {
    "address": ImmutableLine["address"];
};

export const lineWithAddress = (
    line: LineWithRawSource, address: number
) => {
    (line as MutableLine).address = address;
    return line as ImmutableLine;
};
