import type { Failures } from "../failure/failures.ts";
import type {
    PropertiesForMacroProcessing, LineWithProcessedMacro
} from "../macro/line-types.ts";
import type { Line } from "../pipeline/line.ts";
import type { Code } from "../object-code/data-types.ts";

type PropertiesForAddress = PropertiesForMacroProcessing | "address";

export type LineWithAddress = Readonly<Pick<Line, PropertiesForAddress>>;

export const lineWithAddress = (
    line: LineWithProcessedMacro, address: number, failures: Failures
) => {
    (line as Line).address = address;
    line.addFailures(failures);
    return line as LineWithAddress;
};

export type PropertiesForPokedBytes = PropertiesForAddress | "code";

export type LineWithPokedBytes = Readonly<Pick<Line, PropertiesForPokedBytes>>;

export const lineWithPokedBytes = (
    line: LineWithAddress, poked: Array<Code>, failures: Failures
) => {
    (line as Line).code = poked;
    line.addFailures(failures);
    return line as LineWithPokedBytes;
};
