import type { BoringFailure, SupportFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("Lines with no mnemonic don't bother generating code", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.currentLine().code.length).toBe(0);
    expect(systemUnderTest.programMemory.address()).toBe(0);
});

Deno.test("Attempting to generate code with no device selected fails", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().mnemonic = "DES";
    systemUnderTest.currentLine().operands = ["1"];
    systemUnderTest.objectCode.line();
    const failures = systemUnderTest.currentLine().failures;
    expect(failures.length).toBe(3);
    expect(failures[0]!.kind).toBe("device_notSelected");
    expect(failures[1]!.kind).toBe("mnemonic_supportedUnknown");
    expect(failures[2]!.kind).toBe("programMemory_sizeUnknown");
    expect(systemUnderTest.currentLine().code.length).toBe(1);
});

Deno.test("Lines with unsupported instructions fail", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.instructionSet.unsupportedGroups(["DES"]);
    systemUnderTest.currentLine().mnemonic = "DES";
    systemUnderTest.objectCode.line();
    const failures = systemUnderTest.currentLine().failures;
    expect(failures.length).toBe(1);
    const failure = failures[0] as SupportFailure;
    expect(failure.kind).toBe("notSupported_mnemonic");
    expect(failure.used).toBe("DES");
    expect(failure.suggestion).toBe(undefined);
    expect(failure.location).toBe(undefined);
    expect(systemUnderTest.currentLine().code.length).toBe(0);
});

Deno.test("Lines with unknown instructions fail", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.currentLine().mnemonic = "NOT_REAL";
    systemUnderTest.objectCode.line();
    const failures = systemUnderTest.currentLine().failures;
    expect(failures.length).toBe(1);
    const failure = failures[0] as BoringFailure;
    expect(failure.kind).toBe("mnemonic_unknown");
    expect(systemUnderTest.currentLine().code.length).toBe(0);
});

Deno.test("Lines with real/supported instructions produce code", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 10);
    expect(systemUnderTest.programMemory.address()).toBe(0);
    systemUnderTest.currentLine().mnemonic = "DES";
    systemUnderTest.currentLine().operands = ["15"];
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.currentLine().code).toEqual([[0xfb, 0x94]]);
    expect(systemUnderTest.programMemory.address()).toBe(1);
});

Deno.test("If a line has `isDefiningMacro == true`, no code is generated", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.currentLine().mnemonic = "DES";
    systemUnderTest.currentLine().operands = ["15"];
    systemUnderTest.currentLine().isDefiningMacro = true;
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.currentLine().code.length).toBe(0);
    expect(systemUnderTest.programMemory.address()).toBe(0);
});

Deno.test("Generating code will increment the programMemory address", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 10);
    systemUnderTest.currentLine().mnemonic = "NOP";
    expect(systemUnderTest.programMemory.address()).toBe(0);
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
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
    const failures = systemUnderTest.currentLine().failures;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("programMemory_outOfRange");
    // Code is still generated
    expect(systemUnderTest.currentLine().code).toEqual([[0, 0]]);
    // But the address doesn't advance
    expect(systemUnderTest.programMemory.address()).toBe(preFailureAddress);
});
