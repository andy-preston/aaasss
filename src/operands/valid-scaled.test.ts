import { expect } from "jsr:@std/expect";
import type { ClueFailure, NumericTypeFailure, TypeFailure } from "../failure/bags.ts";
import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import { lineWithProcessedMacro } from "../macros/line-types.ts";
import type { NumericType } from "../numeric-values/types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import type { NumericOperand, NumericOperands, OperandIndex, OperandTypes, SymbolicOperands } from "./data-types.ts";
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
    expect(line.failed()).toBeTruthy();
    expect(result).toEqual([0, 0, 0]);
    const failures = line.failures().toArray();
    expect(failures.length).toBe(5);
    {
        const failure = failures[0] as ClueFailure;
        expect(failure.kind).toBe("operand_count");
        expect(failure.location).toBe(undefined);
        expect(failure.clue).toBe("3");
    } {
        const failure = failures[1] as TypeFailure;
        expect(failure.kind).toBe("type_failure");
        expect(failure.location).toEqual({ "operand": 0 });
        expect(failure.expected).toBe("number | string");
        expect(failure.actual).toBe("undefined");
    } {
        const failure = failures[2] as TypeFailure;
        expect(failure.kind).toBe("type_failure");
        expect(failure.location).toEqual({ "operand": 1 });
        expect(failure.expected).toBe("number | string");
        expect(failure.actual).toBe("undefined");
    } {
        const failure = failures[3] as TypeFailure;
        expect(failure.kind).toBe("type_failure");
        expect(failure.location).toEqual({ "operand": 2 });
        expect(failure.expected).toBe("number");
        expect(failure.actual).toBe("undefined");
    } {
        const failure = failures[4] as TypeFailure;
        expect(failure.kind).toBe("type_failure");
        expect(failure.location).toEqual({ "operand": 2 });
        expect(failure.expected).toBe("number | string");
        expect(failure.actual).toBe("undefined");
    }
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
    expect(line.failed()).toBeFalsy();
    expect(result).toEqual([anyNumber, anyNumber]);
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
    expect(line.failed()).toBeTruthy();
    expect(result).toEqual([anyNumber, anyNumber]);
    const failures = line.failures().toArray();
    expect(failures.length).toBe(2);
    failures.forEach((failure, index) => {
        expect(failure.kind).toBe("type_failure");
        const typeFailure = failure as TypeFailure;
        expect(typeFailure.location).toEqual({
            "operand": index as OperandIndex
        });
        expect(typeFailure.expected).toBe(requirements[index]![0]);
        expect(typeFailure.actual).toBe(line.operandTypes[index]!);
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
        "type_ioPort": 0x23,
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
        expect(line.failed(), `${key}`).toBeFalsy();
    }
});

Deno.test("If numeric types don't match the line fails", () => {
    const anySymbolic = "test";
    const testData: Record<NumericType, NumericOperand> = {
        "type_16BitDataAddress": 0xdeadbeef,
        "type_7BitDataAddress": 0x80,
        "type_bitIndex": 9,
        "type_byte": 0xcafe,
        "type_ioPort": 0x60,
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
        expect(line.failed(), numericType).toBeTruthy();
        const failures = line.failures().toArray();
        expect(failures.length).toBe(1);
        const failure = failures[0] as NumericTypeFailure;
        expect(failure.kind).toBe(numericType);
        expect(failure.location).toEqual({"operand": 0});
        expect(failure.value).toBe(value);
        // There is also min and max but I'm not testing them here
    }
});
