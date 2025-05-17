import type { ExceptionFailure } from "../failure/bags.ts";
import type { SymbolicOperands } from "./data-types.ts";

import { expect } from "jsr:@std/expect";
import { jSExpression } from "../javascript/expression.ts";
import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import { currentLine } from "../line/current-line.ts";
import { lineWithProcessedMacro } from "../macros/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { symbolicToNumeric } from "./assembly-pipeline.ts";

export const systemUnderTest = (...lines: Array<SymbolicOperands>) => {
    const testLines = function* () {
        for (const symbolic of lines) {
            const $lineWithRawSource = lineWithRawSource(
                "", 0, "", "", 0, false
            );
            const $lineWithRenderedJavascript = lineWithRenderedJavascript(
                $lineWithRawSource, ""
            );
            const $lineWithTokens = lineWithTokens(
                $lineWithRenderedJavascript, "", "", symbolic
            );
            yield lineWithProcessedMacro(
                $lineWithTokens, false
            );
        }
    };

    const $currentLine = currentLine();
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $jsExpression = jSExpression($symbolTable);
    const $symbolicToNumeric = symbolicToNumeric(
        $symbolTable, $cpuRegisters, $jsExpression
    );
    const assemblyPipeline = $symbolicToNumeric.assemblyPipeline(testLines());
    return {
        "cpuRegisters": $cpuRegisters,
        "symbolTable": $symbolTable,
        "assemblyPipeline": assemblyPipeline
    };
};

Deno.test("An expression yields a value", () => {
    const system = systemUnderTest(["20 / 2"]);
    const result = system.assemblyPipeline.next().value!;
    expect(result.failed()).toBeFalsy();
    expect(result.numericOperands[0]).toBe(10);
    expect(result.operandTypes[0]).toBe("number");
});

Deno.test("A symbol yields a value", () => {
    const system = systemUnderTest(["R7"]);
    system.cpuRegisters.initialise(false);
    const useResult = system.symbolTable.use("R7");
    expect(useResult.type).toBe("number");
    expect(useResult.it).toBe(7);
    const result = system.assemblyPipeline.next().value!;
    expect(result.failed()).toBeFalsy();
    expect(result.numericOperands[0]).toBe(7);
    expect(result.operandTypes[0]).toBe("register");
});

Deno.test("An index prefix/postfix operand gives a zero numeric value", () => {
    const system = systemUnderTest(["X+", "+Y", "Z"]);
    system.cpuRegisters.initialise(false);
    const result = system.assemblyPipeline.next().value!;
    expect(result.failed()).toBeFalsy();
    result.operandTypes.forEach((operandType, index) => {
        const value = result.numericOperands[index];
        expect(operandType).toBe("index");
        expect(value).toBe(0);
    });
});

Deno.test("An uninitialised symbol yields a failure", () => {
    const system = systemUnderTest(["notDefined"]);
    const result = system.assemblyPipeline.next().value!;
    expect(result.failed()).toBeTruthy();
    const failures = [...result.failures()];
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("js_error");
    const failure = failures[0] as ExceptionFailure;
    expect(failure.exception).toBe("ReferenceError");
    expect(failure.message).toBe("notDefined is not defined");
});
