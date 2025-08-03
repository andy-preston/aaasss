import type { AssertionFailure, NumericTypeFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("12 bit relative address can't be beyond 2048 away", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 16 * 1024);
    systemUnderTest.programMemory.origin(1000);
    const address = systemUnderTest.programMemory.relativeAddress(4000, 12);
    expect(typeof address).toBe("object");
    const failure = address as NumericTypeFailure;
    expect(failure.kind).toBe("type_relativeAddress");
    expect(failure.value).toBe(2999);
    expect(failure.min).toBe(-2047);
    expect(failure.max).toBe(2048);
});

Deno.test("12 bit relative address can't be below -2047 away", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 16 * 1024);
    systemUnderTest.programMemory.origin(4000);
    const address = systemUnderTest.programMemory.relativeAddress(1000, 12);
    expect(typeof address).toBe("object");
    const failure = address as NumericTypeFailure;
    expect(failure.kind).toBe("type_relativeAddress");
    expect(failure.value).toBe(-3001);
    expect(failure.min).toBe(-2047);
    expect(failure.max).toBe(2048);
});

Deno.test("Testing a 12 bit relative address that is in range", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 16 * 1024);
    systemUnderTest.programMemory.origin(1000);
    const result = systemUnderTest.programMemory.relativeAddress(2000, 12);
    expect(result).toBe(999);
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
});

Deno.test("7 bit relative address can't be too big", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 16 * 1024);
    systemUnderTest.programMemory.origin(0);
    const address = systemUnderTest.programMemory.relativeAddress(130, 7);
    expect(typeof address).toBe("object");
    const failure = address as NumericTypeFailure;
    expect(failure.kind).toBe("type_relativeAddress");
    expect(failure.value).toBe(129);
    expect(failure.min).toBe(-63);
    expect(failure.max).toBe(64);
});

Deno.test("7 bit relative address can't be too small", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 16 * 1024);
    systemUnderTest.programMemory.origin(500);
    const address = systemUnderTest.programMemory.relativeAddress(100, 7);
    expect(typeof address).toBe("object");
    const failure = address as NumericTypeFailure;
    expect(failure.kind).toBe("type_relativeAddress");
    expect(failure.value).toBe(-401);
    expect(failure.min).toBe(-63);
    expect(failure.max).toBe(64);
});

Deno.test("7 bit relative address can't be beyond program memory", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    const wordsAvailable = 100;
    systemUnderTest.symbolTable.deviceSymbol(
        "programMemoryBytes", wordsAvailable * 2
    );
    systemUnderTest.programMemory.origin(0);
    const address = systemUnderTest.programMemory.relativeAddress(120, 7);
    expect(typeof address).toBe("object");
    const failure = address as AssertionFailure;
    expect(failure.kind).toBe("programMemory_outOfRange");
    expect(failure.expected).toBe(`${wordsAvailable}`);
    expect(failure.actual).toBe("120");
});
