import type { DefinitionFailure, BoringFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("A symbol can be defined and accessed", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.persistentSymbol("plop", 57);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.symbolTable.use("plop")).toEqual(57);
});

Deno.test("A symbol can only be redefined if it's value has not changed", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().fileName = "plop.asm";
    systemUnderTest.currentLine().lineNumber = 23;
    systemUnderTest.symbolTable.persistentSymbol("plop", 57);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    const value = systemUnderTest.symbolTable.use("plop");
    expect(value).toBe(57);

    systemUnderTest.symbolTable.persistentSymbol("plop", 57);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    systemUnderTest.symbolTable.persistentSymbol("plop", 75);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure =
        systemUnderTest.currentLine().failures[0] as DefinitionFailure;
    expect(failure.kind).toBe("symbol_alreadyExists");
    expect(failure.name).toBe("plop");
    expect(failure.definition).toBe("plop.asm:23");
});

Deno.test("Getting a device property when no deviceName is present fails", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("something", 23);
    const result = systemUnderTest.symbolTable.deviceSymbolValue("something", "number");
    expect(result).toBe(undefined);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as BoringFailure;
    expect(failure.kind).toBe("device_notSelected");
});

Deno.test("After loading the device, it returns property values", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "imaginaryDevice");
    systemUnderTest.symbolTable.deviceSymbol("PORTD", 0x3f);
    const result = systemUnderTest.symbolTable.deviceSymbolValue("PORTD", "number");
    expect(result).toBe(0x3f);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
});

Deno.test("Device dependent property values are type checked", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "imaginaryDevice");
    systemUnderTest.symbolTable.deviceSymbol("PORTD", "nonsense");
    expect(
        () => { systemUnderTest.symbolTable.deviceSymbolValue("PORTD", "number"); }
    ).toThrow<Error>(
        "Device configuration error - imaginaryDevice - PORTD - number - nonsense"
    );
});
