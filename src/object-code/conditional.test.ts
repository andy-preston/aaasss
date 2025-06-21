import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("By default, code is generated", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 0x10);

    systemUnderTest.currentLine().mnemonic = "SLEEP";
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.currentLine().code.length).toBe(1);
});

Deno.test("The assembleIf directive can turn code generation off", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 0x10);

    systemUnderTest.currentLine().mnemonic = "SLEEP";
    systemUnderTest.objectCode.assembleIf(false);
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.currentLine().code.length).toBe(0);
});

Deno.test("The assembleIf directive can turn code generation back on", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 0x10);
    systemUnderTest.currentLine().mnemonic = "SLEEP";

    systemUnderTest.objectCode.assembleIf(false);
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.currentLine().code.length).toBe(0);

    systemUnderTest.objectCode.assembleIf(true);
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.currentLine().code.length).toBe(1);
});
