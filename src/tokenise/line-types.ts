import type { Failures } from "../failure/failures.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import type { Label, Mnemonic } from "../source-code/data-types.ts";
import type {
    LineWithRenderedJavascript, PropertiesForRenderedJavascript
} from "../source-code/line-types.ts";
import type { Line } from "../coupling/line.ts";

export type PropertiesForTokens = PropertiesForRenderedJavascript |
    "label" | "mnemonic" | "symbolicOperands";

export type LineWithTokens = Readonly<Pick<Line, PropertiesForTokens>>;

export const lineWithTokens = (
    line: LineWithRenderedJavascript,
    label: Label, mnemonic: Mnemonic, symbolicOperands: SymbolicOperands,
    failures: Failures
) => {
    (line as Line).label = label;
    (line as Line).mnemonic = mnemonic;
    (line as Line).symbolicOperands = symbolicOperands;
    line.addFailures(failures);
    return line as LineWithTokens;
};
