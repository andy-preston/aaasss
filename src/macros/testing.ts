import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import type { Directive } from "../directives/data-types.ts";
import { directiveList } from "../directives/directive-list.ts";
import { emptyBox } from "../failure/failure-or-box.ts";
import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import type { FileLineIterator, SourceOfSource } from "../source-code/file-stack.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import type { Label, Mnemonic } from "../tokens/data-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { macros } from "./macros.ts";

const mockFileStack = () => {
    let lineIterator: FileLineIterator | undefined;
    const include: Directive = () => emptyBox();
    const pushImaginary = (iterator: FileLineIterator) => {
        lineIterator = iterator;
    };
    const lines: SourceOfSource = function* () {
        if (lineIterator == undefined) {
            yield lineWithRawSource("", 0, "", "", 0, false);
            return;
        }
        for (const [source, macroName, macroCount, lastLine] of lineIterator) {
            yield lineWithRawSource(
                "", 0, source, macroName, macroCount, lastLine
            );
        }
    };
    return {
        "include": include,
        "pushImaginary": pushImaginary,
        "lines": lines
    };
};

export const testEnvironment = () => {
    const directives = directiveList();
    const symbols = symbolTable(
        directives, deviceProperties().public, cpuRegisters(), pass()
    );
    const fileStack = mockFileStack();
    const macroProcessor = macros(symbols, fileStack);
    return {
        "symbolTable": symbols,
        "macros": macroProcessor,
        "mockFileStack": fileStack
    };
};

export const testLine = (
    macroName: string, macroCount: number,
    label: Label, mnemonic: Mnemonic, operands: SymbolicOperands
) => {
    const sourceLabel = label ? `${label}: ` : "";
    const mockSource = `${sourceLabel}${mnemonic} ${operands.join(", ")}`;
    const raw = lineWithRawSource(
        "", 0, mockSource, macroName, macroCount, false
    );
    const rendered = lineWithRenderedJavascript(raw, "");
    return lineWithTokens(rendered, label, mnemonic, operands);
};
