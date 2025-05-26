import type { BoringFailure, SupportFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { numberBag, stringBag } from "../assembler/bags.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("Lines with no mnemonic don't bother generating code", () => {
    const system = systemUnderTest();
    system.objectCode.line(system.line);
    expect(system.line.failed()).toBe(false);
    expect(system.line.failures.length).toBe(0);
    expect(system.line.code.length).toBe(0);
    expect(system.programMemory.address()).toBe(0);
});

Deno.test("Attempting to generate code with no device selected fails", () => {
    const system = systemUnderTest();
    system.line.mnemonic = "DES";
    system.objectCode.line(system.line);
    expect(system.line.failed()).toBe(true);
    const failures = system.line.failures;
    expect(failures.length).toBe(2);
    expect(failures[0]!.kind).toBe("device_notSelected");
    expect(failures[1]!.kind).toBe("mnemonic_supportedUnknown");
    expect(system.line.code.length).toBe(0);
});

Deno.test("Lines with unsupported instructions fail", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.instructionSet.unsupportedGroups(["DES"]);
    system.line.mnemonic = "DES";
    system.objectCode.line(system.line);
    expect(system.line.failed()).toBe(true);
    const failures = system.line.failures;
    expect(failures.length).toBe(1);
    const failure = failures[0] as SupportFailure;
    expect(failure.kind).toBe("notSupported_mnemonic");
    expect(failure.used).toBe("DES");
    expect(failure.suggestion).toBe(undefined);
    expect(failure.location).toBe(undefined);
    expect(system.line.code.length).toBe(0);
});

Deno.test("Lines with unknown instructions fail", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.line.mnemonic = "NOT_REAL";
    system.objectCode.line(system.line);
    expect(system.line.failed()).toBe(true);
    const failures = system.line.failures;
    expect(failures.length).toBe(1);
    const failure = failures[0] as BoringFailure;
    expect(failure.kind).toBe("mnemonic_unknown");
    expect(system.line.code.length).toBe(0);
});

Deno.test("Lines with real/supported instructions produce code", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(10));
    expect(system.programMemory.address()).toBe(0);
    system.line.mnemonic = "DES";
    system.line.symbolicOperands = ["15"];
    system.line.numericOperands = [15];
    system.line.operandTypes = ["number"];
    system.objectCode.line(system.line);
    expect(system.line.failed()).toBe(false);
    expect(system.line.code).toEqual([[0x94, 0xfb]]);
    expect(system.programMemory.address()).toBe(1);
});

Deno.test("If a line has `isDefiningMacro == true`, no code is generated", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.line.mnemonic = "DES";
    system.line.symbolicOperands = ["15"];
    system.line.numericOperands = [15];
    system.line.operandTypes = ["number"];
    system.line.isDefiningMacro = true;
    system.objectCode.line(system.line);
    expect(system.line.failed()).toBe(false);
    expect(system.line.code.length).toBe(0);
    expect(system.programMemory.address()).toBe(0);
});

Deno.test("Generating code will increment the programMemory address", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(10));
    system.line.mnemonic = "NOP";
    expect(system.programMemory.address()).toBe(0);
    system.objectCode.line(system.line);
    expect(system.line.failed()).toBe(false);
    expect(system.line.code).toEqual([[0, 0]]);
    expect(system.programMemory.address()).toBe(1);
});

Deno.test("Insufficient program memory causes generation to fail", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0x00));
    const preFailureAddress = system.programMemory.address();
    system.line.mnemonic = "NOP";
    system.objectCode.line(system.line);
    expect(system.line.failed()).toBe(true);
    const failures = system.line.failures;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("programMemory_outOfRange");
    // Code is still generated
    expect(system.line.code).toEqual([[0, 0]]);
    // But the address doesn't advance
    expect(system.programMemory.address()).toBe(preFailureAddress);
});
