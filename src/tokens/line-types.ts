import type {
    LineWithRenderedJavascript, PropertiesForRenderedJavascript
} from "../embedded-js/line-types.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import type { Line } from "../pipeline/line.ts";
import type { Label, Mnemonic } from "../source-code/data-types.ts";

export type PropertiesForTokens = PropertiesForRenderedJavascript |
    "label" | "mnemonic" | "symbolicOperands";

export type LineWithTokens = Readonly<Pick<Line, PropertiesForTokens>>;

export const lineWithTokens = (
    line: LineWithRenderedJavascript,
    label: Label, mnemonic: Mnemonic, symbolicOperands: SymbolicOperands
) => {
    (line as Line).label = label;
    (line as Line).mnemonic = mnemonic;
    (line as Line).symbolicOperands = symbolicOperands;
    return line as LineWithTokens;
};
