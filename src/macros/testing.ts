import type { FunctionUseDirective, StringDirective } from "../directives/bags.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import type { FileLineIterator } from "../source-code/file-stack.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { Label, Mnemonic } from "../tokens/data-types.ts";

import { expect } from "jsr:@std/expect";
import { emptyBag } from "../assembler/bags.ts";
import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
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
    const assemblyPipeline = function* () {
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
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($cpuRegisters);
    const $mockFileStack = mockFileStack();
    const $macros = macros($symbolTable, $mockFileStack);
    return {
        "symbolTable": $symbolTable,
        "macros": $macros,
        "mockFileStack": $mockFileStack
    };
};

export type TestLine = {
    "macroName": string; "macroCount": number;
    "label": Label; "mnemonic": Mnemonic; "symbolicOperands": SymbolicOperands;
};

export const testLines = function* (
    lines: Array<TestLine>
) {
    for (const line of lines) {
        const label = line.label ? `${line.label}: ` : "";
        const reconstructedSource = `${label}${line.mnemonic}`;
        const $lineWithRawSource = lineWithRawSource(
            "", 0, reconstructedSource, line.macroName, line.macroCount, false
        );
        const $lineWithRenderedJavascript = lineWithRenderedJavascript(
            $lineWithRawSource, reconstructedSource
        );
        yield lineWithTokens(
            $lineWithRenderedJavascript,
            line.label, line.mnemonic, line.symbolicOperands
        );
    }
};

export const macroFromTable = (symbolTable: SymbolTable, macroName: string) => {
    const fromTable = symbolTable.use(macroName);
    expect(fromTable.type).toBe("functionUseDirective");
    return fromTable as FunctionUseDirective;
};
