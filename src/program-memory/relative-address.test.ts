import type { AssertionFailure, BagOfFailures, NumericTypeFailure } from "../failure/bags.ts";
import type { NumberBag } from "../assembler/bags.ts";

import { expect } from "jsr:@std/expect";
import { systemUnderTest } from "./testing.ts";
import { numberBag, stringBag } from "../assembler/bags.ts";

Deno.test("12 bit relative address can't be beyond 2048 away", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("dummy"));
    system.symbolTable.deviceSymbol(
        "programMemoryBytes", numberBag(16 * 1024)
    );
    system.programMemory.origin(1000);
    const address = system.programMemory.relativeAddress(4000, 12);
    expect(address.type).toBe("failures");
    const failures = address as BagOfFailures;
    const failure = failures.it[0]! as NumericTypeFailure;
    expect(failure.kind).toBe("type_relativeAddress");
    expect(failure.value).toBe(2999);
    expect(failure.min).toBe(-2047);
    expect(failure.max).toBe(2048);
});

Deno.test("12 bit relative address can't be below -2047 away", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("dummy"));
    system.symbolTable.deviceSymbol(
        "programMemoryBytes", numberBag(16 * 1024)
    );
    system.programMemory.origin(4000);
    const address = system.programMemory.relativeAddress(1000, 12);
    expect(address.type).toBe("failures");
    const failures = address as BagOfFailures;
    const failure = failures.it[0]! as NumericTypeFailure;
    expect(failure.kind).toBe("type_relativeAddress");
    expect(failure.value).toBe(-3001);
    expect(failure.min).toBe(-2047);
    expect(failure.max).toBe(2048);
});

Deno.test("Testing a 12 bit relative address that is in range", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("dummy"));
    system.symbolTable.deviceSymbol(
        "programMemoryBytes", numberBag(16 * 1024)
    );
    system.programMemory.origin(1000);
    const result = system.programMemory.relativeAddress(2000, 12);
    expect(result.type).toBe("number");
    const address = result as NumberBag;
    expect(address.it).toBe(999);
});

Deno.test("7 bit relative address can't be beyond -63 - 64 range", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("dummy"));
    system.symbolTable.deviceSymbol(
        "programMemoryBytes", numberBag(16 * 1024)
    );
    {
        system.programMemory.origin(0);
        const address = system.programMemory.relativeAddress(130, 7);
        expect(address.type).toBe("failures");
        const failures = address as BagOfFailures;
        const failure = failures.it[0]! as NumericTypeFailure;
        expect(failure.kind).toBe("type_relativeAddress");
        expect(failure.value).toBe(129);
        expect(failure.min).toBe(-63);
        expect(failure.max).toBe(64);
    } {
        system.programMemory.origin(500);
        const address = system.programMemory.relativeAddress(100, 7);
        expect(address.type).toBe("failures");
        const failures = address as BagOfFailures;
        const failure = failures.it[0]! as NumericTypeFailure;
        expect(failure.kind).toBe("type_relativeAddress");
        expect(failure.value).toBe(-401);
        expect(failure.min).toBe(-63);
        expect(failure.max).toBe(64);
    }
});

Deno.test("7 bit relative address can't be beyond program memory", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("dummy"));
    system.symbolTable.deviceSymbol(
        "programMemoryBytes", numberBag(20)
    );
    system.programMemory.origin(1000);
    const result = system.programMemory.relativeAddress(23, 7);
    expect(result.type).toBe("failures");
    const failures = result as BagOfFailures;
    const failure = failures.it[0]! as AssertionFailure;
    expect(failure.kind).toBe("programMemory_outOfRange");
    expect(failure.expected).toBe("10");
    expect(failure.actual).toBe("23");
});
