import type { VoidDirective } from "../directives/bags.ts";
import type { NumberBag } from "../assembler/bags.ts";

import { expect } from "jsr:@std/expect";
import { emptyBag, numberBag } from "../assembler/bags.ts";
import { testSystem } from "./testing.ts";

Deno.test("A symbol is returned but not counted if it's a directive", () => {
    const system = testSystem();
    const fakeDirective: VoidDirective = {
        "type": "voidDirective", "it": () => emptyBag()
    };
    system.symbolTable.builtInSymbol("findMe", fakeDirective);
    expect(system.symbolTable.use("findMe")).toEqual(fakeDirective);
    expect(system.symbolTable.count("findMe")).toBe(0);
});

Deno.test("A symbol is returned and counted if it's a device property", () => {
    const system = testSystem();
    system.symbolTable.deviceSymbol("test", numberBag(57));
    for (const expectedCount of [1, 2, 3]) {
        const result = system.symbolTable.use("test");
        expect(result.type).toBe("number");
        expect((result as NumberBag).it).toBe(57);
        const count = system.symbolTable.count("test");
        expect(count).toBe(expectedCount);
    }
});

Deno.test("Device properties don't 'become' symbols until they're used", () => {
    const system = testSystem();
    system.symbolTable.deviceSymbol("test", numberBag(57));
    expect(system.symbolTable.count("test")).toBe(0);
});

Deno.test("A symbol is returned and counted if it's a CPU register", () => {
    const system = testSystem();
    system.cpuRegisters.initialise(false);

    for (const expectedCount of [1, 2, 3]) {
        expect(system.symbolTable.use("R15")).toEqual(numberBag(15));
        expect(system.symbolTable.count("R15")).toBe(expectedCount);
    }
});

Deno.test("CPU registers don't 'become' symbols until they're used", () => {
    const system = testSystem();
    system.cpuRegisters.initialise(false);
    expect(system.symbolTable.count("R15")).toBe(0);
});
