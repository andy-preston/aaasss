import { lineWithRenderedJavascript } from "../embedded-js/line-types.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import type { Label, Mnemonic } from "../source-code/data-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";

export const testLine = (
    label: Label, mnemonic: Mnemonic, operands: SymbolicOperands
) => {
    const raw = lineWithRawSource("", 0, false, "");
    const rendered = lineWithRenderedJavascript(raw, "");
    return lineWithTokens(rendered, label, mnemonic, operands, []);
};
