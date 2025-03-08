import { assert, assertEquals, assertFalse } from "assert";
import { assertFailureWithExtra } from "../failure/testing.ts";
import type { OldFailure } from "../failure/bags.ts";
import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import { lineWithProcessedMacro } from "../macros/line-types.ts";
import type { NumericType } from "../numeric-values/types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import type { NumericOperand, NumericOperands, OperandTypes, SymbolicOperands } from "./data-types.ts";
import { lineWithOperands } from "./line-types.ts";
import { validScaledOperands, type Requirements } from "./valid-scaled.ts";

const testLine = (
    symbolicOperands: SymbolicOperands,
    numericOperands: NumericOperands,
    operandTypes: OperandTypes
) => {
    const withSource = lineWithRawSource("", 0, "", "", 0, false);
    const withJavascript = lineWithRenderedJavascript(withSource, "");
    const withTokens = lineWithTokens(withJavascript, "", "", symbolicOperands);
    const postMacro = lineWithProcessedMacro(withTokens, false);
    return lineWithOperands(postMacro, numericOperands, operandTypes);
}

const anyNumber = 15;
const anySymbolic = "test";
const someNumericType: NumericType = "type_positive";

Deno.test("The number of operands much match", () => {
    const line = testLine([], [], ["register", "number"]);

    const requirements: Requirements = [
        ["register", someNumericType, 0],
        ["number",   someNumericType, 1],
        ["number",   someNumericType, 2],
    ];

    const result = validScaledOperands(line, requirements);
    assert(line.failed());
    assertEquals(result, [0, 0, 0]);
    const failures = line.failures().toArray();
    assertEquals(failures.length, 1);
    assertFailureWithExtra(failures, "operand_wrongCount", ["3"]);
    assertEquals((failures[0] as OldFailure).operand, undefined);
});

Deno.test("The required operand type must match the actual operand types", () => {
    const line = testLine(
        [anySymbolic, anySymbolic],
        [  anyNumber,   anyNumber],
        [ "register",    "number"]
    );
    const requirements: Requirements = [
        ["number",   someNumericType, 1],
        ["register", someNumericType, 0],
    ];
    const result = validScaledOperands(line, requirements);
    assertFalse(line.failed());
    assertEquals(result, [anyNumber, anyNumber]);
});

Deno.test("If they don't match the line is marked with a failure", () => {
    const line = testLine(
        [anySymbolic, anySymbolic],
        [  anyNumber,   anyNumber],
        [ "register",    "number"]
    );
    const requirements: Requirements = [
        ["number",   someNumericType, 0],
        ["register", someNumericType, 1],
    ];
    const result = validScaledOperands(line, requirements);
    assert(line.failed());
    assertEquals(result, [0, 0]);
    const failures = line.failures().toArray();
    assertEquals(failures.length, 2);
    failures.forEach((failure, index) => {
        assertEquals(failure.kind, "operand_wrongType");
        const oldStyle = failure as OldFailure;
        assertEquals(oldStyle.operand, index);
        assertEquals(oldStyle.extra, [requirements[index]![0]]);
    });
});

Deno.test("The required numeric type must match the actual type", () => {
    const anySymbolic = "test";
    const testData: Record<NumericType, NumericOperand> = {
        "type_16BitDataAddress": 0xcafe,
        "type_7BitDataAddress": 0x4e,
        "type_bitIndex": 3,
        "type_word": 0xf00d,
        "type_byte": 0xda,
        "type_nybble": 8,
        "type_positive": 23,
        "type_register": 30,
        "type_registerImmediate": 16,
    } as const;
    for (const [key, value] of Object.entries(testData)) {
        const numericType = key as NumericType;
        const line = testLine([anySymbolic], [value], ["number"]);
        validScaledOperands(line, [["number", numericType, 0]]);
        // The result might be scaled, so we're not checking it here!
        assertFalse(line.failed(), `${key}`);
    }
});

Deno.test("If numeric types don't match the line fails", () => {
    const anySymbolic = "test";
    const testData: Record<NumericType, NumericOperand> = {
        "type_16BitDataAddress": 0xdeadbeef,
        "type_7BitDataAddress": 0x80,
        "type_bitIndex": 9,
        "type_byte": 0xcafe,
        "type_nybble": 0xab,
        "type_positive": -10,
        "type_register": 40,
        "type_registerImmediate": 3,
        "type_word": 0xdeadbeef,
    } as const;
    for (const [key, value] of Object.entries(testData)) {
        const numericType = key as NumericType;
        const line = testLine([anySymbolic], [value], ["number"]);
        validScaledOperands(line, [["number", numericType, 0]]);
        // The result might be scaled, so we're not checking it here!
        assert(line.failed());
        const failures = line.failures().toArray();
        assertEquals(failures.length, 1);
        const oldStyle = failures[0] as OldFailure;
        assertEquals(oldStyle.kind, numericType);
        assertEquals(oldStyle.operand, 0);
        const extras = oldStyle.extra as Array<string>;
        assert(Array.isArray(extras));
        assertEquals(extras.length, 3);
        assertEquals(extras[0], `${value}`);
        // The other 2 are expected min and max - I'm not testing that here
    }
});
