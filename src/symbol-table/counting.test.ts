import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";
import { DirectiveFunction } from "../directives/data-types.ts";

Deno.test("A symbol is returned but not counted if it's a directive", () => {
    const systemUnderTest = testSystem();
    const fakeDirective: DirectiveFunction = () => undefined;
    systemUnderTest.symbolTable.builtInSymbol("findMe", fakeDirective);
    expect(systemUnderTest.symbolTable.use("findMe")).toEqual(fakeDirective);
    expect(systemUnderTest.symbolTable.count("findMe")).toBe(0);
});

Deno.test("A symbol is returned and counted if it's a device property", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("test", 57);
    for (const expectedCount of [1, 2, 3]) {
        const result = systemUnderTest.symbolTable.use("test");
        expect(result).toBe(57);
        const count = systemUnderTest.symbolTable.count("test");
        expect(count).toBe(expectedCount);
    }
});

Deno.test("Device properties don't 'become' symbols until they're used", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("test", 57);
    expect(systemUnderTest.symbolTable.count("test")).toBe(0);
});

Deno.test("A symbol is returned and counted if it's a CPU register", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.cpuRegisters.initialise(false);
    for (const expectedCount of [1, 2, 3]) {
        expect(systemUnderTest.symbolTable.use("R15")).toEqual(15);
        expect(systemUnderTest.symbolTable.count("R15")).toBe(expectedCount);
    }
});

Deno.test("CPU registers don't 'become' symbols until they're used", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.cpuRegisters.initialise(false);
    expect(systemUnderTest.symbolTable.count("R15")).toBe(0);
});
