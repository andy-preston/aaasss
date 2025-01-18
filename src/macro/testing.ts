import { lineWithRenderedJavascript } from "../javascript/embedded/line-types.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import type { Label, Mnemonic } from "../source-code/data-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";

export const testLine = (
    label: Label, mnemonic: Mnemonic, operands: SymbolicOperands
) => {
    const sourceLabel = label ? `${label}: ` : "";
    const mockSource = `${sourceLabel}${mnemonic} ${operands.join(", ")}`;
    const raw = lineWithRawSource("", 0, false, mockSource);
    const rendered = lineWithRenderedJavascript(raw, mockSource);
    return lineWithTokens(rendered, label, mnemonic, operands);
};
