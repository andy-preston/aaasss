import type { FunctionUseDirective, StringDirective } from "../directives/bags.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import type { FileLineIterator, AssemblyPipelineSource } from "../source-code/file-stack.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { Label, Mnemonic } from "../tokens/data-types.ts";

import { expect } from "jsr:@std/expect";
import { emptyBag } from "../assembler/bags.ts";
import { pass } from "../assembler/pass.ts";
import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { SourceCode } from "../source-code/data-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { macros } from "./macros.ts";

const mockFileStack = () => {
    let lineIterator: FileLineIterator | undefined;
    const includeDirective: StringDirective = {
        "type": "stringDirective", "it": () => emptyBag()
    };
    const pushImaginary = (iterator: FileLineIterator) => {
        lineIterator = iterator;
    };
    const assemblyPipeline: AssemblyPipelineSource = function* () {
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
        "includeDirective": includeDirective,
        "pushImaginary": pushImaginary,
        "assemblyPipeline": assemblyPipeline
    };
};

export const systemUnderTest = () => {
    const thePass = pass();
    const symbols = symbolTable(cpuRegisters());
    const fileStack = mockFileStack();
    const macroProcessor = macros(symbols, fileStack);
    thePass.resetStateCallback(symbols.resetState);
    return {
        "symbolTable": symbols,
        "macros": macroProcessor,
        "mockFileStack": fileStack,
        "pass": thePass
    };
};

export const testLine = (
    macroName: string, macroCount: number,
    label: Label, mnemonic: Mnemonic, operands: SymbolicOperands
) => {
    const raw = lineWithRawSource("", 0, "", macroName, macroCount, false);
    const rendered = lineWithRenderedJavascript(raw, "");
    return lineWithTokens(rendered, label, mnemonic, operands);
};

export const testLineWithSource = (
    sourceCode: SourceCode,
    label: Label, mnemonic: Mnemonic, operands: SymbolicOperands
) => {
    const raw = lineWithRawSource("", 0, sourceCode, "", 0, false);
    const rendered = lineWithRenderedJavascript(raw, "");
    return lineWithTokens(rendered, label, mnemonic, operands);
};

export const macroFromTable = (symbolTable: SymbolTable, macroName: string) => {
    const fromTable = symbolTable.use(macroName);
    expect(fromTable.type).toBe("functionUseDirective");
    return fromTable as FunctionUseDirective;
};
