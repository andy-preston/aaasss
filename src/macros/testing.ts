import { pass } from "../assembler/pass.ts";
import { anEmptyContext } from "../javascript/context.ts";
import { jSExpression } from "../javascript/expression.ts";
import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import type { Label, Mnemonic } from "../source-code/data-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { macros } from "./macros.ts";

export const testEnvironment = () => {
    const context = anEmptyContext();
    const symbols = symbolTable(context, pass());
    const macroProcessor = macros(symbols);
    symbols.directive("macro", macroProcessor.macro);
    symbols.directive("end", macroProcessor.end);
    return {
        "symbolTable": symbols,
        "jsExpression": jSExpression(context),
        "macros": macroProcessor
    };
};

export const testLine = (
    label: Label, mnemonic: Mnemonic, operands: SymbolicOperands
) => {
    const sourceLabel = label ? `${label}: ` : "";
    const mockSource = `${sourceLabel}${mnemonic} ${operands.join(", ")}`;
    const raw = lineWithRawSource("", 0, false, mockSource);
    const rendered = lineWithRenderedJavascript(raw, mockSource);
    return lineWithTokens(rendered, label, mnemonic, operands);
};
