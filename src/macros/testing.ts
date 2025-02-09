import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { directiveList } from "../directives/directive-list.ts";
import { jSExpression } from "../javascript/expression.ts";
import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import type { Label, Mnemonic } from "../tokens/data-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { macros } from "./macros.ts";

export const testEnvironment = () => {
    const directives = directiveList();
    const symbols = symbolTable(
        directives, deviceProperties().public, cpuRegisters() ,pass()
    );
    const macroProcessor = macros(symbols);
    directives.includes("macro", macroProcessor.macro);
    directives.includes("end", macroProcessor.end);
    return {
        "symbolTable": symbols,
        "jsExpression": jSExpression(symbols),
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
