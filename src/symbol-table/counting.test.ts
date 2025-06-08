import type { VoidDirective } from "../directives/bags.ts";
import type { NumberBag } from "../assembler/bags.ts";

import { expect } from "jsr:@std/expect";
import { emptyBag, numberBag } from "../assembler/bags.ts";
import { testSystem } from "./testing.ts";

Deno.test("A symbol is returned but not counted if it's a directive", () => {
    const systemUnderTest = testSystem();
    const fakeDirective: VoidDirective = {
        "type": "voidDirective", "it": () => emptyBag()
    };
    systemUnderTest.symbolTable.builtInSymbol("findMe", fakeDirective);
    expect(systemUnderTest.symbolTable.use("findMe")).toEqual(fakeDirective);
    expect(systemUnderTest.symbolTable.count("findMe")).toBe(0);
});

Deno.test("A symbol is returned and counted if it's a device property", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("test", numberBag(57));
    for (const expectedCount of [1, 2, 3]) {
        const result = systemUnderTest.symbolTable.use("test");
        expect(result.type).toBe("number");
        expect((result as NumberBag).it).toBe(57);
        const count = systemUnderTest.symbolTable.count("test");
        expect(count).toBe(expectedCount);
    }
});

Deno.test("Device properties don't 'become' symbols until they're used", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("test", numberBag(57));
    expect(systemUnderTest.symbolTable.count("test")).toBe(0);
});

Deno.test("A symbol is returned and counted if it's a CPU register", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.cpuRegisters.initialise(false);

    for (const expectedCount of [1, 2, 3]) {
        expect(systemUnderTest.symbolTable.use("R15")).toEqual(numberBag(15));
        expect(systemUnderTest.symbolTable.count("R15")).toBe(expectedCount);
    }
});

Deno.test("CPU registers don't 'become' symbols until they're used", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.cpuRegisters.initialise(false);
    expect(systemUnderTest.symbolTable.count("R15")).toBe(0);
});
