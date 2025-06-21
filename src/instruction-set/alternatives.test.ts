import type { SupportFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("RCALL is offered as an alternative to CALL", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.instructionSet.unsupportedGroups(["flashMore8"]);
    systemUnderTest.currentLine().mnemonic = "CALL";
    const result = systemUnderTest.instructionSet.instruction()!;
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure =
        systemUnderTest.currentLine().failures[0] as SupportFailure;
    expect(failure.kind).toBe("notSupported_mnemonic");
    expect(failure.used).toBe("CALL");
    expect(failure.suggestion).toBe("RCALL");
    expect(result).toBe(undefined);
});

Deno.test("RJMP is offered as an alternative to JMP", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.instructionSet.unsupportedGroups(["flashMore8"]);
    systemUnderTest.currentLine().mnemonic = "JMP";
    const result = systemUnderTest.instructionSet.instruction()!;
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure =
        systemUnderTest.currentLine().failures[0] as SupportFailure;
    expect(failure.kind).toBe("notSupported_mnemonic");
    expect(failure.used).toBe("JMP");
    expect(failure.suggestion).toBe("RJMP");
    expect(result).toBe(undefined);
});

Deno.test("ICALL is offered as an alternative to EICALL", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.instructionSet.unsupportedGroups(["flashMore128"]);
    systemUnderTest.currentLine().mnemonic = "EICALL";
    const result = systemUnderTest.instructionSet.instruction()!;
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure =
        systemUnderTest.currentLine().failures[0] as SupportFailure;
    expect(failure.kind).toBe("notSupported_mnemonic");
    expect(failure.used).toBe("EICALL");
    expect(failure.suggestion).toBe("ICALL");
    expect(result).toBe(undefined);
});

Deno.test("IJMP is offered as an alternative to EIJMP", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.instructionSet.unsupportedGroups(["flashMore128"]);
    systemUnderTest.currentLine().mnemonic = "EIJMP";
    const result = systemUnderTest.instructionSet.instruction()!;
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure =
        systemUnderTest.currentLine().failures[0] as SupportFailure;
    expect(failure.kind).toBe("notSupported_mnemonic");
    expect(failure.used).toBe("EIJMP");
    expect(failure.suggestion).toBe("IJMP");
    expect(result).toBe(undefined);
});

Deno.test("DES has no alternative", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.instructionSet.unsupportedGroups(["DES"]);
    systemUnderTest.currentLine().mnemonic = "DES";
    const result = systemUnderTest.instructionSet.instruction()!;
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure =
        systemUnderTest.currentLine().failures[0] as SupportFailure;
    expect(failure.kind).toBe("notSupported_mnemonic");
    expect(failure.used).toBe("DES");
    expect(failure.suggestion).toBe(undefined);
    expect(result).toBe(undefined);
});
