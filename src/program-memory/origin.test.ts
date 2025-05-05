import type { AssertionFailure, Failure, NumericTypeFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { systemUnderTest } from "./testing.ts";
import { numberBag, stringBag } from "../assembler/bags.ts";

Deno.test("A device must be selected before program memory can be set", () => {
    const system = systemUnderTest();
    const result = system.programMemory.origin(10);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(2);
    expect(failures[0]!.kind).toBe("device_notSelected");
    expect(failures[1]!.kind).toBe("programMemory_sizeUnknown");
});

Deno.test("Origin addresses can't be less than zero", () => {
    const system = systemUnderTest();
    const result = system.programMemory.origin(-1);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as NumericTypeFailure;
    expect(failure.kind).toBe("type_positive");
    expect(failure.location).toEqual({"parameter": 0});
    expect(failure.value).toBe(-1);
    expect(failure.min).toBe(0);
    expect(failure.max).toBe(undefined);
});

Deno.test("Device name is used to determine if properties have been set", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));
    const result = system.programMemory.origin(10);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(2);
    expect(failures[0]!.kind).toBe("device_notSelected");
    expect(failures[1]!.kind).toBe("programMemory_sizeUnknown");
});

Deno.test("Origin addresses must be progmem size when a device is chosen", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    const bytesAvailable = 100;
    system.symbolTable.deviceSymbol(
        "programMemoryBytes", numberBag(bytesAvailable)
    );
    const tryOrigin = 92;
    const result = system.programMemory.origin(tryOrigin);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("programMemory_outOfRange");
    const failure = failures[0] as AssertionFailure;
    expect(failure.expected).toBe(`${bytesAvailable / 2}`);
    expect(failure.actual).toBe(`${tryOrigin}`);
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
