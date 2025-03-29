import { expect } from "jsr:@std/expect";
import { numberBag } from "../assembler/bags.ts";
import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { directiveList } from "../directives/directive-list.ts";
import type { ExceptionFailure } from "../failure/bags.ts";
import { jSExpression } from "../javascript/expression.ts";
import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import { lineWithProcessedMacro } from "../macros/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import type { SymbolicOperands } from "./data-types.ts";
import { symbolicToNumeric } from "./symbolic-to-numeric.ts";

const systemUnderTest = () => {
    const registers = cpuRegisters();
    const symbols = symbolTable(
        directiveList(), deviceProperties().public, registers, pass()
    );
    return {
        "cpuRegisters": registers,
        "symbolTable": symbols,
        "symbolicToNumeric": symbolicToNumeric(
            symbols, registers, jSExpression(symbols)
        )
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
    const result = system.symbolicToNumeric(testLine(["20 / 2"]));
    expect(result.failed()).toBeFalsy();
    expect(result.numericOperands[0]).toBe(10);
    expect(result.operandTypes[0]).toBe("number");
});

Deno.test("A symbol yields a value", () => {
    const system = systemUnderTest();
    system.cpuRegisters.initialise(false);
    expect(system.symbolTable.use("R7")).toEqual(numberBag(7));
    const result = system.symbolicToNumeric(testLine(["R7"]));
    expect(result.failed()).toBeFalsy();
    expect(result.numericOperands[0]).toBe(7);
    expect(result.operandTypes[0]).toBe("register");
});

Deno.test("An index offset operand returns special values not related to the symbol table", () => {
    const system = systemUnderTest();
    const result = system.symbolicToNumeric(testLine(["Z+", "Y+"]));
    expect(result.failed()).toBeFalsy();
    expect(result.numericOperands[0]).toBe(0);
    expect(result.numericOperands[1]).toBe(1);
    expect(result.operandTypes).toEqual(["index_offset", "index_offset"]);
});

Deno.test("An uninitialised symbol yields a failure", () => {
    const system = systemUnderTest();
    const result = system.symbolicToNumeric(testLine(["notDefined"]));
    expect(result.failed()).toBeTruthy();
    const failures = result.failures().toArray();
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("js_error");
    const failure = failures[0] as ExceptionFailure;
    expect(failure.exception).toBe("ReferenceError");
    expect(failure.message).toBe("notDefined is not defined");
});
