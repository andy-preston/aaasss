import type { ExceptionFailure } from "../failure/bags.ts";
import type { SymbolicOperands } from "./data-types.ts";

import { expect } from "jsr:@std/expect";
import { jSExpression } from "../javascript/expression.ts";
import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import { lineWithProcessedMacro } from "../macros/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { symbolicToNumeric } from "./assembly-pipeline.ts";

const systemUnderTest = () => {
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($cpuRegisters);
    const $jsExpression = jSExpression($symbolTable);
    const $symbolicToNumeric = symbolicToNumeric(
        $symbolTable, $cpuRegisters, $jsExpression
    );
    return {
        "cpuRegisters": $cpuRegisters,
        "symbolTable": $symbolTable,
        "assemblyPipeline": $symbolicToNumeric.assemblyPipeline
    };
};

const testLine = (symbolic: SymbolicOperands) => {
    const withSource = lineWithRawSource("", 0, "", "", 0, false);
    const withJavascript = lineWithRenderedJavascript(withSource, "");
    const withTokens = lineWithTokens(withJavascript, "", "", symbolic)
    return lineWithProcessedMacro(withTokens, false);
}

Deno.test("An expression yields a value", () => {
    const system = systemUnderTest();
    const result = system.assemblyPipeline(testLine(["20 / 2"]));
    expect(result.failed()).toBeFalsy();
    expect(result.numericOperands[0]).toBe(10);
    expect(result.operandTypes[0]).toBe("number");
});

Deno.test("A symbol yields a value", () => {
    const system = systemUnderTest();
    system.cpuRegisters.initialise(false);
    const useResult = system.symbolTable.use("R7");
    expect(useResult.type).toBe("number");
    expect(useResult.it).toBe(7);
    const result = system.assemblyPipeline(testLine(["R7"]));
    expect(result.failed()).toBeFalsy();
    expect(result.numericOperands[0]).toBe(7);
    expect(result.operandTypes[0]).toBe("register");
});

Deno.test("An index prefix/postfix operand gives a zero numeric value", () => {
    const system = systemUnderTest();
    system.cpuRegisters.initialise(false);
    const result = system.assemblyPipeline(testLine(["X+", "+Y", "Z"]));
    expect(result.failed()).toBeFalsy();
    result.operandTypes.forEach((operandType, index) => {
        const value = result.numericOperands[index];
        expect(operandType).toBe("index");
        expect(value).toBe(0);
    });
});

Deno.test("An uninitialised symbol yields a failure", () => {
    const system = systemUnderTest();
    const result = system.assemblyPipeline(testLine(["notDefined"]));
    expect(result.failed()).toBeTruthy();
    const failures = [...result.failures()];
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("js_error");
    const failure = failures[0] as ExceptionFailure;
    expect(failure.exception).toBe("ReferenceError");
    expect(failure.message).toBe("notDefined is not defined");
});
