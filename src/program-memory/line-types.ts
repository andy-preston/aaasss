import type { MutableLine } from "../assembler/line.ts";
import type { LineWithObjectCode } from "../object-code/line-types.ts";

export type LineWithAddress = Readonly<Pick<
    MutableLine, keyof LineWithObjectCode | "address"
>>;

export const lineWithAddress = (
    line: LineWithObjectCode, address: number
) => {
    (line as MutableLine).address = address;
    return line as LineWithAddress;
};
