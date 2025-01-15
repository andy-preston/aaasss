import type { Line } from "../assembler/line.ts";
import { LineWithObjectCode } from "../object-code/line-types.ts";

export type LineWithAddress = Readonly<Pick<
    Line, keyof LineWithObjectCode | "address"
>>;

export const lineWithAddress = (
    line: LineWithObjectCode, address: number
) => {
    (line as Line).address = address;
    return line as LineWithAddress;
};
