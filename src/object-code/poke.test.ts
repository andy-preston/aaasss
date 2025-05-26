import type { AssertionFailure, NumericTypeFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect/expect";
import { numberBag, stringBag } from "../assembler/bags.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("You can poke bytes", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(20));
    system.objectCode.poke([1, 2, 3, 4]);
    expect(system.line.failed()).toBe(false);
    expect(system.line.code).toEqual([[1, 2], [3, 4]]);
});

Deno.test("Poked bytes are grouped in sets of 4", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(20));
    system.objectCode.poke([1, 2, 3, 4, 5, 6]);
    expect(system.line.failed()).toBe(false);
    expect(system.line.code).toEqual([[1, 2], [3, 4], [5, 6]]);
});

Deno.test("Poked bytes are padded to an even number", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(20));

    system.objectCode.poke([1, 2, 3]);
    expect(system.line.failed()).toBe(false);
    expect(system.line.code).toEqual([
        [1, 2], [3, 0]
    ]);

    system.objectCode.poke([1, 2, 3, 4, 5]);
    expect(system.line.failed()).toBe(false);
    expect(system.line.code).toEqual([
        [1, 2], [3, 0],
        [1, 2], [3, 4], [5, 0]
    ]);
});

Deno.test("You can also poke ASCII strings", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(20));
    system.objectCode.poke(["Hello"]);
    expect(system.line.failed()).toBe(false);
    expect(system.line.code).toEqual([
        [72, 101], [108, 108], [111, 0]
    ]);
});

Deno.test("... or UTF-8 strings", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(20));
    system.objectCode.poke(["ਕਿੱਦਾਂ"]);
    expect(system.line.failed()).toBe(false);
    expect(system.line.code).toEqual([
        [224, 168], [149, 224], [168, 191], [224, 169],
        [177, 224], [168, 166], [224, 168], [190, 224], [168, 130]
    ]);
});

Deno.test("... or a combination of bytes and strings", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(20));
    system.objectCode.poke([1, 2, 3, 4, "Hello"]);
    expect(system.line.failed()).toBe(false);
    expect(system.line.code).toEqual([
        [1, 2], [3, 4], [72, 101], [108, 108], [111, 0]
    ]);
})

Deno.test("Poked numbers must be bytes (0-255)", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(20));
    system.objectCode.poke([-1, 2, 300, 4]);
    expect(system.line.failed()).toBe(true);
    expect(system.line.failures.length).toBe(2);
    {
        const failure = system.line.failures[0] as NumericTypeFailure;
        expect(failure.kind).toBe("type_bytesOrString");
        expect(failure.location).toEqual({"parameter": 0});
        expect(failure.value).toBe(-1);
    } {
        const failure = system.line.failures[1] as NumericTypeFailure;
        expect(failure.kind).toBe("type_bytesOrString");
        expect(failure.location).toEqual({"parameter": 2});
        expect(failure.value).toBe(300);
    }
    expect(system.line.code).toEqual([[2, 4]]);
});

Deno.test("Poking will increment the programMemory address", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(20));
    expect(system.programMemory.address()).toBe(0);
    system.objectCode.poke([1, 2, 3, 4]);
    expect(system.line.failed()).toBe(false);
    expect(system.programMemory.address()).toBe(2);
});

Deno.test("Insufficient program memory causes poking to fail", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0x00));
    const preFailureAddress = system.programMemory.address();
    const testData = [1, 2, 3, 4];
    system.objectCode.poke(testData);
    expect(system.line.failed()).toBe(true);
    expect(system.line.failures.length).toBe(1);
    const failure = system.line.failures[0] as AssertionFailure;
    expect(failure.kind).toBe("programMemory_outOfRange");
    expect(failure.actual).toBe("0");
    expect(failure.expected).toBe(`${testData.length / 2}`);
    // Code is still generated
    expect(system.line.code).toEqual([[1, 2], [3, 4]]);
    // But the address doesn't advance
    expect(system.programMemory.address()).toBe(preFailureAddress);
});
