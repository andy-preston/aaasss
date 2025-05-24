import type { AssertionFailure, NumericTypeFailure } from "../failure/bags.ts";
import type { NumericType } from "../numeric-values/types.ts";
import type { NumericOperand, OperandIndex } from "./data-types.ts";
import type { OperandRequirement, OperandRequirements } from "./valid-scaled.ts";

import { expect } from "jsr:@std/expect";
import { dummyLine } from "../line/line-types.ts";
import { validScaledOperands } from "./valid-scaled.ts";

const anyNumber = 15;
const anySymbolic = "test";
const someNumericType: NumericType = "type_positive";

Deno.test("The number of operands much match", () => {
    const line = dummyLine(false);
    line.symbolicOperands = ["R1", "23"];
    line.numericOperands = [1, 23];
    line.operandTypes = ["register", "number"];
    const operandRequirements: OperandRequirements = [
        ["register", someNumericType],
        ["number",   someNumericType],
        ["number",   someNumericType],
    ];
    const result = validScaledOperands(line, operandRequirements);
    expect(line.failed()).toBeTruthy();
    expect(result).toEqual([1, 23, 0]);
    expect(line.failures.length).toBe(3);
    {
        const failure = line.failures[0] as AssertionFailure;
        expect(failure.kind).toBe("operand_count");
        expect(failure.location).toBe(undefined);
        expect(failure.expected).toBe("3");
        expect(failure.actual).toBe("2")
    } {
        const failure = line.failures[1] as AssertionFailure;
        expect(failure.kind).toBe("type_failure");
        expect(failure.location).toEqual({ "operand": 2 });
        expect(failure.expected).toBe("number");
        expect(failure.actual).toBe("undefined");
    } {
        const failure = line.failures[2] as AssertionFailure;
        expect(failure.kind).toBe("type_failure");
        expect(failure.location).toEqual({ "operand": 2 });
        expect(failure.expected).toBe("number | string");
        expect(failure.actual).toBe("undefined");
    }
});

Deno.test("The required operand type must match the actual operand types", () => {
    const line = dummyLine(false);
    line.symbolicOperands = [anySymbolic, anySymbolic];
    line.numericOperands =  [  anyNumber,   anyNumber];
    line.operandTypes =     [ "register",    "number"];
    const operandRequirements: OperandRequirements = [
        ["register", someNumericType],
        ["number",   someNumericType]
    ];
    const result = validScaledOperands(line, operandRequirements);
    expect(line.failed()).toBeFalsy();
    expect(result).toEqual([anyNumber, anyNumber]);
});

Deno.test("If they don't match the line is marked with a failure", () => {
    const line = dummyLine(false);
    line.symbolicOperands = [anySymbolic, anySymbolic];
    line.numericOperands =  [  anyNumber,   anyNumber];
    line.operandTypes =     [ "register",    "number"];
    const operandRequirements: OperandRequirements = [
        ["number",   someNumericType],
        ["register", someNumericType]
    ];
    const result = validScaledOperands(line, operandRequirements);
    expect(line.failed()).toBeTruthy();
    expect(result).toEqual([anyNumber, anyNumber]);
    expect(line.failures.length).toBe(2);
    line.failures.forEach((failure, index) => {
        expect(failure.kind).toBe("type_failure");
        const assertionFailure = failure as AssertionFailure;
        expect(assertionFailure.location).toEqual({
            "operand": index as OperandIndex
        });
        expect(assertionFailure.expected).toBe(operandRequirements[index]![0]);
        expect(assertionFailure.actual).toBe(line.operandTypes[index]!);
    });
});

Deno.test("The required numeric type must match the actual type", () => {
    const anySymbolic = "test";
    const testData: Record<NumericType, NumericOperand> = {
        "type_anything": 0,
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
        const line = dummyLine(false);
        line.symbolicOperands = [anySymbolic];
        line.numericOperands =  [value];
        line.operandTypes =     ["number"];
        validScaledOperands(line, [["number", numericType]]);
        // The result might be scaled, so we're not checking it here!
        expect(line.failed(), `${key}`).toBeFalsy();
    }
});

Deno.test("If numeric types don't match the line fails", () => {
    const anySymbolic = "test";
    const testData: Record<NumericType, NumericOperand> = {
        "type_anything": 1,
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
        const line = dummyLine(false);
        line.symbolicOperands = [anySymbolic];
        line.numericOperands =  [value];
        line.operandTypes =     ["number"];
        validScaledOperands(line, [["number", numericType]]);
        // The result might be scaled, so we're not checking it here!
        if (numericType == "type_anything") {
            expect(line.failed(), numericType).toBeFalsy();
        } else {
            expect(line.failed(), numericType).toBeTruthy();
            expect(line.failures.length).toBe(1);
            const failure = line.failures[0] as NumericTypeFailure;
            expect(failure.kind).toBe(numericType);
            expect(failure.location).toEqual({"operand": 0});
            expect(failure.value).toBe(value);
            // There is also min and max but I'm not testing them here
        }
    }
});

Deno.test("type_anything can be any numeric value", () => {
    [0, -1, 2].forEach(value => {
        const line = dummyLine(false);
        line.symbolicOperands = [""];
        line.numericOperands =  [value];
        line.operandTypes =     ["number"];
        const requirement: OperandRequirement = ["number", "type_anything"];
        const result = validScaledOperands(line, [requirement]);
        expect(result[0]).toBe(value);
        expect(line.failed()).toBeFalsy();
    });
});
