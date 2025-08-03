import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("A symbol can be defined and accessed", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.persistentSymbol("plop", 57);
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.symbolTable.use("plop")).toBe(57);
});

Deno.test("A symbol can only be redefined if it's value has not changed", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().fileName = "plop.asm";
    systemUnderTest.currentLine().lineNumber = 23;
    systemUnderTest.symbolTable.persistentSymbol("plop", 57);
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    const value = systemUnderTest.symbolTable.use("plop");
    expect(value).toBe(57);

    systemUnderTest.symbolTable.persistentSymbol("plop", 57);
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    systemUnderTest.symbolTable.persistentSymbol("plop", 75);
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "symbol_alreadyExists", "location": undefined,
        "name": "plop", "definition": "plop.asm:23"
    }]);
});

Deno.test("Getting a device property when no deviceName is present fails", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("something", 23);
    const result = systemUnderTest.symbolTable.deviceSymbolValue("something", "number");
    expect(result).toBe(undefined);
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "device_notSelected", "location": undefined
    }]);
});

Deno.test("After loading the device, it returns property values", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "imaginaryDevice");
    systemUnderTest.symbolTable.deviceSymbol("PORTD", 0x3f);
    const result = systemUnderTest.symbolTable.deviceSymbolValue("PORTD", "number");
    expect(result).toBe(0x3f);
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
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
