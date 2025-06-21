import type { DefinitionFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("A label is stored in the symbol table with the current address", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "test");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 0xff);
    systemUnderTest.programMemory.origin(10);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);

    systemUnderTest.currentLine().label = "A_LABEL";
    systemUnderTest.programMemory.lineLabel();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.symbolTable.use("A_LABEL")).toEqual(10);
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
        systemUnderTest.currentLine().label = "A_LABEL";
        systemUnderTest.programMemory.lineLabel();
        expect(systemUnderTest.currentLine().failures.length).toBe(0);
        expect(systemUnderTest.symbolTable.use("A_LABEL")).toEqual(10);
    });
    systemUnderTest.programMemory.origin(20);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    systemUnderTest.programMemory.lineLabel();
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure =
        systemUnderTest.currentLine().failures[0] as DefinitionFailure;
    expect(failure.kind).toBe("symbol_alreadyExists");
    expect(failure.name).toBe("A_LABEL");
    expect(failure.definition).toBe("plop.asm:23");
    expect(systemUnderTest.symbolTable.use("A_LABEL")).toEqual(10);
});

Deno.test("Labels are available to javascript", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "test");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 0xff);
    systemUnderTest.currentLine().label = "A_LABEL";
    systemUnderTest.programMemory.origin(10);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.currentLine().address).toBe(10);
    systemUnderTest.programMemory.lineLabel();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.symbolTable.symbolValue("A_LABEL")).toEqual(10);
});
