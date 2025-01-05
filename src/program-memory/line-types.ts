import { LineWithObjectCode } from "../object-code/line-types.ts";
import type { Line } from "../pipeline/line.ts";

export type LineWithAddress = Readonly<Pick<
    Line, keyof LineWithObjectCode | "address"
>>;

export const lineWithAddress = (
    line: LineWithObjectCode, address: number
) => {
    (line as Line).address = address;
    return line as LineWithAddress;
};
