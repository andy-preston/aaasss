import type { MutableLine } from "../assembler/line.ts";
import type { LineWithRenderedJavascript } from "../javascript/line-types.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import type { Label, Mnemonic } from "./data-types.ts";

export type LineWithTokens = Readonly<Pick<
    MutableLine,
    keyof LineWithRenderedJavascript | "label" | "mnemonic" | "symbolicOperands"
>>;

export const lineWithTokens = (
    line: LineWithRenderedJavascript,
    label: Label, mnemonic: Mnemonic, symbolicOperands: SymbolicOperands
) => {
    (line as MutableLine).label = label;
    (line as MutableLine).mnemonic = mnemonic;
    (line as MutableLine).symbolicOperands = symbolicOperands;
    return line as LineWithTokens;
};
