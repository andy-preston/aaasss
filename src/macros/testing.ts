import type { StringDirective } from "../directives/bags.ts";
import type { DirectiveResult } from "../directives/data-types.ts";
import type { FileLineIterator } from "../source-code/data-types.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import type { Label, Mnemonic } from "../tokens/data-types.ts";
import type { MacroName, MacroParameters } from "./data-types.ts";

import { emptyBag } from "../assembler/bags.ts";
import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { macroPipeline } from "./assembly-pipeline.ts";
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
        for (const [source, macroName, macroCount] of lineIterator) {
            yield lineWithRawSource("", 0, source, macroName, macroCount, false);
        }
    };
    return {
        "includeDirective": includeDirective,
        "pushImaginary": pushImaginary,
        "assemblyPipeline": assemblyPipeline
    };
};

const mockUse = (
    _macroName: MacroName, _macroParameters: MacroParameters
): DirectiveResult => emptyBag();

export const systemUnderTest = () => {
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($cpuRegisters);
    const $mockFileStack = mockFileStack();
    const $macros = macros($symbolTable, $mockFileStack);
    $macros.directiveForMacroUse({
        "type": "functionUseDirective", "it": mockUse
    });
    return {
        "symbolTable": $symbolTable,
        "mockFileStack": $mockFileStack,
        "macros": $macros,
    };
};

type SystemUnderTest = ReturnType<typeof systemUnderTest>;

export type TestLine = {
    "macroName": string; "macroCount": number;
    "label": Label; "mnemonic": Mnemonic; "symbolicOperands": SymbolicOperands;
};

export const testLine = (line: TestLine) => {
    const label = line.label ? `${line.label}: ` : "";
    const reconstructedSource = `${label}${line.mnemonic}`;
    const $lineWithRawSource = lineWithRawSource(
        "", 0, reconstructedSource, line.macroName, line.macroCount, false
    );
    const $lineWithRenderedJavascript = lineWithRenderedJavascript(
        $lineWithRawSource, reconstructedSource
    );
    return lineWithTokens(
        $lineWithRenderedJavascript,
        line.label, line.mnemonic, line.symbolicOperands
    );
};

export const testPipelineWithLines = (
    system: SystemUnderTest, lines: Array<TestLine>
) => {
    const $macroPipeline = macroPipeline(system.macros);

    const testLines = function* (lines: Array<TestLine>) {
        for (const line of lines) {
            yield testLine(line);
        }
    };

    return $macroPipeline.assemblyPipeline(testLines(lines));
};

export const testPipeLineWithFileStack = (
    system: SystemUnderTest
) => {
    const $macroPipeline = macroPipeline(system.macros);
    const $filePipeline = system.mockFileStack.assemblyPipeline();
    return $macroPipeline.assemblyPipeline($filePipeline);
};
