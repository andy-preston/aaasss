import type { AssertionFailure, BoringFailure, NumericTypeFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { systemUnderTest } from "./testing.ts";
import { numberBag, stringBag } from "../assembler/bags.ts";

Deno.test("A device must be selected before program memory can be set", () => {
    const system = systemUnderTest();
    system.programMemory.origin(10);
    expect(system.line.failed()).toBe(true);
    expect(system.line.failures.length).toBe(2);
    expect(system.line.failures[0]!.kind).toBe("device_notSelected");
    expect(system.line.failures[1]!.kind).toBe("programMemory_sizeUnknown");
});

Deno.test("Origin addresses can't be less than zero", () => {
    const system = systemUnderTest();
    system.programMemory.origin(-1);
    expect(system.line.failed()).toBe(true);
    expect(system.line.failures.length).toBe(1);
    const failure = system.line.failures[0] as NumericTypeFailure;
    expect(failure.kind).toBe("type_positive");
    expect(failure.location).toEqual({"parameter": 0});
    expect(failure.value).toBe(-1);
    expect(failure.min).toBe(0);
    expect(failure.max).toBe(undefined);
});

Deno.test("Device name is used to determine if properties have been set", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));
    system.programMemory.origin(10);
    expect(system.line.failed()).toBe(true);
    expect(system.line.failures.length).toBe(2);
    expect(system.line.failures[0]!.kind).toBe("device_notSelected");
    expect(system.line.failures[1]!.kind).toBe("programMemory_sizeUnknown");
});

Deno.test("Origin addresses must be progmem size when a device is chosen", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    const wordsAvailable = 100;
    system.symbolTable.deviceSymbol(
        "programMemoryBytes", numberBag(wordsAvailable * 2)
    );
    const tryOrigin = 110;
    system.programMemory.origin(tryOrigin);
    expect(system.line.failed()).toBe(true);
    expect(system.line.failures.length).toBe(1);
    expect(system.line.failures[0]!.kind).toBe("programMemory_outOfRange");
    const failure = system.line.failures[0] as AssertionFailure;
    expect(failure.actual).toBe(`${tryOrigin}`);
    expect(failure.expected).toBe(`${wordsAvailable}`);
});

Deno.test("Origin directive sets current address", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));
    {
        const origin = system.programMemory.origin(23);
        expect(origin.type).not.toBe("failures");
    }
    expect(system.programMemory.address()).toBe(23);
    {
        const origin = system.programMemory.origin(42);
        expect(origin.type).not.toBe("failures");
    }
    expect(system.programMemory.address()).toBe(42);
});

Deno.test("Origin is blocked by code in current line", () => {
    const system = systemUnderTest();
    system.line.code.push([0, 0]);
    system.programMemory.origin(0);
    expect(system.line.failed()).toBe(true);
    expect(system.line.failures.length).toBe(1);
    const failure = system.line.failures[0]! as BoringFailure;
    expect(failure.kind).toBe("programMemory_cantOrg");
});

Deno.test("Origin is not blocked when there's no code in current line", () => {
    const system = systemUnderTest();
    system.programMemory.origin(0);
    expect(system.line.failed()).toBe(false);
});
