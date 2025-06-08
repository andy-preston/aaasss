import type { AssertionFailure, BoringFailure, NumericTypeFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";
import { numberBag, stringBag } from "../assembler/bags.ts";

Deno.test("A device must be selected before program memory can be set", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.programMemory.origin(10);
    expect(systemUnderTest.line.failed()).toBe(true);
    expect(systemUnderTest.line.failures.length).toBe(2);
    expect(systemUnderTest.line.failures[0]!.kind).toBe("device_notSelected");
    expect(systemUnderTest.line.failures[1]!.kind).toBe("programMemory_sizeUnknown");
});

Deno.test("Origin addresses can't be less than zero", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.programMemory.origin(-1);
    expect(systemUnderTest.line.failed()).toBe(true);
    expect(systemUnderTest.line.failures.length).toBe(1);
    const failure = systemUnderTest.line.failures[0] as NumericTypeFailure;
    expect(failure.kind).toBe("type_positive");
    expect(failure.location).toEqual({"parameter": 0});
    expect(failure.value).toBe(-1);
    expect(failure.min).toBe(0);
    expect(failure.max).toBe(undefined);
});

Deno.test("Device name is used to determine if properties have been set", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));
    systemUnderTest.programMemory.origin(10);
    expect(systemUnderTest.line.failed()).toBe(true);
    expect(systemUnderTest.line.failures.length).toBe(2);
    expect(systemUnderTest.line.failures[0]!.kind).toBe("device_notSelected");
    expect(systemUnderTest.line.failures[1]!.kind).toBe("programMemory_sizeUnknown");
});

Deno.test("Origin addresses must be progmem size when a device is chosen", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    const wordsAvailable = 100;
    systemUnderTest.symbolTable.deviceSymbol(
        "programMemoryBytes", numberBag(wordsAvailable * 2)
    );
    const tryOrigin = 110;
    systemUnderTest.programMemory.origin(tryOrigin);
    expect(systemUnderTest.line.failed()).toBe(true);
    expect(systemUnderTest.line.failures.length).toBe(1);
    expect(systemUnderTest.line.failures[0]!.kind).toBe("programMemory_outOfRange");
    const failure = systemUnderTest.line.failures[0] as AssertionFailure;
    expect(failure.actual).toBe(`${tryOrigin}`);
    expect(failure.expected).toBe(`${wordsAvailable}`);
});

Deno.test("Origin directive sets current address", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));
    {
        const origin = systemUnderTest.programMemory.origin(23);
        expect(origin.type).not.toBe("failures");
    }
    expect(systemUnderTest.programMemory.address()).toBe(23);
    {
        const origin = systemUnderTest.programMemory.origin(42);
        expect(origin.type).not.toBe("failures");
    }
    expect(systemUnderTest.programMemory.address()).toBe(42);
});

Deno.test("Origin is blocked by code in current line", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.line.code.push([0, 0]);
    systemUnderTest.programMemory.origin(0);
    expect(systemUnderTest.line.failed()).toBe(true);
    expect(systemUnderTest.line.failures.length).toBe(1);
    const failure = systemUnderTest.line.failures[0]! as BoringFailure;
    expect(failure.kind).toBe("programMemory_cantOrg");
});

Deno.test("Origin is not blocked when there's no code in current line", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.programMemory.origin(0);
    expect(systemUnderTest.line.failed()).toBe(false);
});
