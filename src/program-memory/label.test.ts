import type { DefinitionFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("A label is stored in the symbol table with the current address", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "test");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 0xff);
    systemUnderTest.programMemory.origin(10);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);

    systemUnderTest.currentLine().label = "aLabel";
    systemUnderTest.programMemory.lineLabel();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.symbolTable.use("aLabel")).toEqual(10);
});

Deno.test("New labels have the 'local scope' suffix if it's defined", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "test");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 0xff);
    systemUnderTest.programMemory.origin(10);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);

    systemUnderTest.currentLine().label = "aLabel";
    systemUnderTest.currentLine().symbolSuffix = "$aMacro$5";
    systemUnderTest.programMemory.lineLabel();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(
        systemUnderTest.symbolTable.internalValue("aLabel$aMacro$5")
    ).toEqual(10);
    expect(
        systemUnderTest.symbolTable.internalValue("aLabel")
    ).toEqual("");
});

Deno.test("Labels can only be redefined if their value doesn't change", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "test");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 0xff);
    [1, 2].forEach((_try) => {
        systemUnderTest.programMemory.origin(10);
        expect(systemUnderTest.currentLine().failures.length).toBe(0);

        systemUnderTest.currentLine().fileName = "plop.asm";
        systemUnderTest.currentLine().lineNumber = 23;
        systemUnderTest.currentLine().label = "aLabel";
        systemUnderTest.programMemory.lineLabel();
        expect(systemUnderTest.currentLine().failures.length).toBe(0);
        expect(systemUnderTest.symbolTable.use("aLabel")).toEqual(10);
    });
    systemUnderTest.programMemory.origin(20);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    systemUnderTest.programMemory.lineLabel();
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure =
        systemUnderTest.currentLine().failures[0] as DefinitionFailure;
    expect(failure.kind).toBe("symbol_alreadyExists");
    expect(failure.name).toBe("aLabel");
    expect(failure.definition).toBe("plop.asm:23");
    expect(systemUnderTest.symbolTable.use("aLabel")).toEqual(10);
});

Deno.test("Labels are available to javascript", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "test");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 0xff);
    systemUnderTest.currentLine().label = "aLabel";
    systemUnderTest.programMemory.origin(10);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.currentLine().address).toBe(10);
    systemUnderTest.programMemory.lineLabel();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.symbolTable.use("aLabel")).toEqual(10);
});
