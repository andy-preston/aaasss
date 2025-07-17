import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("Lines with no mnemonic don't bother generating code", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(systemUnderTest.currentLine().code).toEqual([]);
    expect(systemUnderTest.programMemory.address()).toBe(0);
});

Deno.test("Attempting to generate code with no device selected fails", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().mnemonic = "DES";
    systemUnderTest.currentLine().operands = ["1"];
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "device_notSelected", "location": undefined
    }, {
        "kind": "mnemonic_supportedUnknown", "location": undefined,
        "clue": "DES"
    }, {
        "kind": "programMemory_sizeUnknown", "location": undefined
    }]);
    expect(systemUnderTest.currentLine().code).toEqual([[0x1b, 0x94]]);
});

Deno.test("Lines with unsupported instructions fail", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.instructionSet.unsupportedGroups(["DES"]);
    systemUnderTest.currentLine().mnemonic = "DES";
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "notSupported_mnemonic", "location": undefined,
        "used": "DES", "suggestion": undefined
    }]);
    expect(systemUnderTest.currentLine().code).toEqual([]);
});

Deno.test("Lines with unknown instructions fail", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.currentLine().mnemonic = "NOT_REAL";
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "mnemonic_unknown", "location": undefined,
        "clue": "NOT_REAL"
    }]);
    expect(systemUnderTest.currentLine().code).toEqual([]);
});

Deno.test("Lines with real/supported instructions produce code", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 10);
    expect(systemUnderTest.programMemory.address()).toBe(0);
    systemUnderTest.currentLine().mnemonic = "DES";
    systemUnderTest.currentLine().operands = ["15"];
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(systemUnderTest.currentLine().code).toEqual([[0xfb, 0x94]]);
    expect(systemUnderTest.programMemory.address()).toBe(1);
});

Deno.test("Generating code will increment the programMemory address", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 10);
    systemUnderTest.currentLine().mnemonic = "NOP";
    expect(systemUnderTest.programMemory.address()).toBe(0);
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(systemUnderTest.currentLine().code).toEqual([[0, 0]]);
    expect(systemUnderTest.programMemory.address()).toBe(1);
});

Deno.test("Insufficient program memory causes generation to fail", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 0x00);
    const preFailureAddress = systemUnderTest.programMemory.address();
    systemUnderTest.currentLine().mnemonic = "NOP";
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "programMemory_outOfRange", "location": undefined,
        "expected": "0", "actual": "1"
    }]);
    // Code is still generated
    expect(systemUnderTest.currentLine().code).toEqual([[0, 0]]);
    // But the address doesn't advance
    expect(systemUnderTest.programMemory.address()).toBe(preFailureAddress);
});
