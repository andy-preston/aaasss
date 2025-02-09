import { assert, assertEquals } from "assert";
import { pass } from "../assembler/pass.ts";
import { directiveList } from "../directives/directive-list.ts";
import { assertFailureWithError } from "../failure/testing.ts";
import { jSExpression } from "../javascript/expression.ts";
import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import { lineWithProcessedMacro } from "../macros/line-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import type { SymbolicOperands } from "./data-types.ts";
import { symbolicToNumeric } from "./symbolic-to-numeric.ts";
import { deviceProperties } from "../device/properties.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";

const testEnvironment = () => {
    const symbols = symbolTable(
        directiveList(), deviceProperties().public, cpuRegisters() ,pass()
    );
    return {
        "symbolTable": symbols,
        "operands": symbolicToNumeric(jSExpression(symbols))
    };
};

const testLine = (symbolic: SymbolicOperands) => {
    const withSource = lineWithRawSource("", 0, false, "");
    const withJavascript = lineWithRenderedJavascript(withSource, "");
    const withTokens = lineWithTokens(withJavascript, "", "", symbolic)
    return lineWithProcessedMacro(withTokens, false);
}

Deno.test("An expression yields a value", () => {
    const environment = testEnvironment();
    const result = environment.operands(testLine(["20 / 2"]));
    assertEquals(result.numericOperands[0], 10);
    assertEquals(result.operandTypes[0], "number");
});

Deno.test("A symbol yields a value", () => {
    const environment = testEnvironment();
    environment.symbolTable.add("R7", 7);
    assertEquals(environment.symbolTable.use("R7"), 7);
    const result = environment.operands(testLine(["R7"]));
    assertEquals(result.numericOperands[0], 7);
    //assertEquals(result.operandTypes[0], "register");
    assertEquals(result.operandTypes[0], "number");
});

Deno.test("An index offset operand returns special values not related to the symbol table", () => {
    const environment = testEnvironment();
    const result = environment.operands(testLine(["Z+", "Y+"]));
    assertEquals(result.numericOperands[0], 0);
    assertEquals(result.numericOperands[1], 1);
    assertEquals(result.operandTypes, ["index_offset", "index_offset"]);
});

Deno.test("An uninitialised symbol yields a failure", () => {
    const environment = testEnvironment();
    const result = environment.operands(testLine(["notDefined"]));
    assert(result.failed());
    result.failures().forEach((failure, index) => {
        assertEquals(index, 0);
        assertFailureWithError(
            failure,
            "js_error",
            ReferenceError,
            "notDefined is not defined"
        );
        assertEquals(failure.operand, 0);
    });
});
