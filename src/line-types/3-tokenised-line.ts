import type { Failures } from "../coupling/value-failure.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import type { Label, Mnemonic } from "../source-code/data-types.ts";
import type { AssemblyLine, AssemblyProperties } from "../source-code/line-types.ts";
import type { Line } from "./0-line.ts";

export type TokenisedProperties = AssemblyProperties |
    "label" | "mnemonic" | "symbolicOperands";

export type TokenisedLine = Readonly<Pick<Line, TokenisedProperties>>;

export const tokenisedLine = (
    line: AssemblyLine,
    label: Label,
    mnemonic: Mnemonic,
    symbolicOperands: SymbolicOperands,
    failures: Failures
): TokenisedLine => {
    (line as Line).label = label;
    (line as Line).mnemonic = mnemonic;
    (line as Line).symbolicOperands = symbolicOperands;
    line.addFailures(failures);
    return line as TokenisedLine;
};
