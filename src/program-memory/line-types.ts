import type { LineWithProcessedMacro } from "../macro/line-types.ts";
import type { Line } from "../pipeline/line.ts";

export type LineWithAddress = Readonly<Pick<
    Line, keyof LineWithProcessedMacro | "address"
>>;

export const lineWithAddress = (
    line: LineWithProcessedMacro, address: number
) => {
    (line as Line).address = address;
    return line as LineWithAddress;
};
