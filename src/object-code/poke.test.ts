import type { AssertionFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect/expect";
import { numberBag, stringBag } from "../assembler/bags.ts";
import { testSystem } from "./testing.ts";

Deno.test("You can poke bytes", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", stringBag("plop"));
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", numberBag(20));
    systemUnderTest.objectCode.poke([1, 2, 3, 4]);
    expect(systemUnderTest.line.failed()).toBe(false);
    expect(systemUnderTest.line.code).toEqual([[1, 2], [3, 4]]);
});

Deno.test("Poked bytes are grouped in sets of 4", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", stringBag("plop"));
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", numberBag(20));
    systemUnderTest.objectCode.poke([1, 2, 3, 4, 5, 6]);
    expect(systemUnderTest.line.failed()).toBe(false);
    expect(systemUnderTest.line.code).toEqual([[1, 2], [3, 4], [5, 6]]);
});

Deno.test("Poked bytes are padded to an even number", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", stringBag("plop"));
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", numberBag(20));

    systemUnderTest.objectCode.poke([1, 2, 3]);
    expect(systemUnderTest.line.failed()).toBe(false);
    expect(systemUnderTest.line.code).toEqual([
        [1, 2], [3, 0]
    ]);

    systemUnderTest.objectCode.poke([1, 2, 3, 4, 5]);
    expect(systemUnderTest.line.failed()).toBe(false);
    expect(systemUnderTest.line.code).toEqual([
        [1, 2], [3, 0],
        [1, 2], [3, 4], [5, 0]
    ]);
});

Deno.test("You can also poke ASCII strings", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", stringBag("plop"));
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", numberBag(20));
    systemUnderTest.objectCode.poke(["Hello"]);
    expect(systemUnderTest.line.failed()).toBe(false);
    expect(systemUnderTest.line.code).toEqual([
        [72, 101], [108, 108], [111, 0]
    ]);
});

Deno.test("... or UTF-8 strings", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", stringBag("plop"));
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", numberBag(20));
    systemUnderTest.objectCode.poke(["ਕਿੱਦਾਂ"]);
    expect(systemUnderTest.line.failed()).toBe(false);
    expect(systemUnderTest.line.code).toEqual([
        [224, 168], [149, 224], [168, 191], [224, 169],
        [177, 224], [168, 166], [224, 168], [190, 224], [168, 130]
    ]);
});

Deno.test("... or a combination of bytes and strings", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", stringBag("plop"));
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", numberBag(20));
    systemUnderTest.objectCode.poke([1, 2, 3, 4, "Hello"]);
    expect(systemUnderTest.line.failed()).toBe(false);
    expect(systemUnderTest.line.code).toEqual([
        [1, 2], [3, 4], [72, 101], [108, 108], [111, 0]
    ]);
})

Deno.test("Poked numbers must be bytes (0-255)", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", stringBag("plop"));
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", numberBag(20));
    systemUnderTest.objectCode.poke([-1, 2, 300, 4]);
    expect(systemUnderTest.line.failed()).toBe(true);
    expect(systemUnderTest.line.failures.length).toBe(2);
    {
        const failure = systemUnderTest.line.failures[0] as AssertionFailure;
        expect(failure.kind).toBe("value_type");
        expect(failure.location).toEqual({"parameter": 0});
        expect(failure.actual).toBe("-1");
        expect(failure.expected).toBe("string, byte");
    } {
        const failure = systemUnderTest.line.failures[1] as AssertionFailure;
        expect(failure.kind).toBe("value_type");
        expect(failure.location).toEqual({"parameter": 2});
        expect(failure.actual).toBe("300");
        expect(failure.expected).toBe("string, byte");
    }
    expect(systemUnderTest.line.code).toEqual([[0, 2], [0, 4]]);
});

Deno.test("Poking will increment the programMemory address", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", stringBag("plop"));
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", numberBag(20));
    expect(systemUnderTest.programMemory.address()).toBe(0);
    systemUnderTest.objectCode.poke([1, 2, 3, 4]);
    expect(systemUnderTest.line.failed()).toBe(false);
    expect(systemUnderTest.programMemory.address()).toBe(2);
});

Deno.test("Insufficient program memory causes poking to fail", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", stringBag("plop"));
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0x00));
    const preFailureAddress = systemUnderTest.programMemory.address();
    const testData = [1, 2, 3, 4];
    systemUnderTest.objectCode.poke(testData);
    expect(systemUnderTest.line.failed()).toBe(true);
    expect(systemUnderTest.line.failures.length).toBe(1);
    const failure = systemUnderTest.line.failures[0] as AssertionFailure;
    expect(failure.kind).toBe("programMemory_outOfRange");
    expect(failure.actual).toBe(`${testData.length / 2}`);
    expect(failure.expected).toBe("0");
    // Code is still generated
    expect(systemUnderTest.line.code).toEqual([[1, 2], [3, 4]]);
    // But the address doesn't advance
    expect(systemUnderTest.programMemory.address()).toBe(preFailureAddress);
});

Deno.test("Nothing gets poked, if we're currently defining a macro", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", stringBag("plop"));
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0x00));
    const prePokeAddress = systemUnderTest.programMemory.address();
    systemUnderTest.line.isDefiningMacro = true;
    systemUnderTest.objectCode.poke([1, 2, 3, 4]);
    expect(systemUnderTest.line.failed()).toBe(false);
    expect(systemUnderTest.line.failures.length).toBe(0);
    expect(systemUnderTest.programMemory.address()).toBe(prePokeAddress);
    expect(systemUnderTest.line.code.length).toBe(0);
});
