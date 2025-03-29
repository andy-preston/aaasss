import { assert, assertEquals, assertFalse } from "jsr:@std/assert";
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
    assertFalse(result.failed());
    assertEquals(result.numericOperands[0], 10);
    assertEquals(result.operandTypes[0], "number");
});

Deno.test("A symbol yields a value", () => {
    const system = systemUnderTest();
    system.cpuRegisters.initialise(false);
    assertEquals(system.symbolTable.use("R7"), numberBag(7));
    const result = system.symbolicToNumeric(testLine(["R7"]));
    assertFalse(result.failed());
    assertEquals(result.numericOperands[0], 7);
    assertEquals(result.operandTypes[0], "register");
});

Deno.test("An index offset operand returns special values not related to the symbol table", () => {
    const system = systemUnderTest();
    const result = system.symbolicToNumeric(testLine(["Z+", "Y+"]));
    assertFalse(result.failed());
    assertEquals(result.numericOperands[0], 0);
    assertEquals(result.numericOperands[1], 1);
    assertEquals(result.operandTypes, ["index_offset", "index_offset"]);
});

Deno.test("An uninitialised symbol yields a failure", () => {
    const system = systemUnderTest();
    const result = system.symbolicToNumeric(testLine(["notDefined"]));
    assert(result.failed());
    const failures = result.failures().toArray();
    assertEquals(failures.length, 1);
    assertEquals(failures[0]!.kind, "js_error");
    const failure = failures[0] as ExceptionFailure;
    assertEquals(failure.exception, "ReferenceError");
    assertEquals(failure.message, "notDefined is not defined");
});
