import type { SupportFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { stringBag } from "../assembler/bags.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("RCALL is offered as an alternative to CALL", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("plop"));
    system.instructionSet.unsupportedGroups(["flashMore8"]);
    system.line.mnemonic = "CALL";
    const result = system.instructionSet.instruction(system.line)!;
    expect(system.line.failed()).toBe(true);
    expect(system.line.failures.length).toBe(1);
    const failure = system.line.failures[0] as SupportFailure;
    expect(failure.kind).toBe("notSupported_mnemonic");
    expect(failure.used).toBe("CALL");
    expect(failure.suggestion).toBe("RCALL");
    expect(result).toBe(undefined);
});

Deno.test("RJMP is offered as an alternative to JMP", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("plop"));
    system.instructionSet.unsupportedGroups(["flashMore8"]);
    system.line.mnemonic = "JMP";
    const result = system.instructionSet.instruction(system.line)!;
    expect(system.line.failed()).toBe(true);
    expect(system.line.failures.length).toBe(1);
    const failure = system.line.failures[0] as SupportFailure;
    expect(failure.kind).toBe("notSupported_mnemonic");
    expect(failure.used).toBe("JMP");
    expect(failure.suggestion).toBe("RJMP");
    expect(result).toBe(undefined);
});

Deno.test("ICALL is offered as an alternative to EICALL", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("plop"));
    system.instructionSet.unsupportedGroups(["flashMore128"]);
    system.line.mnemonic = "EICALL";
    const result = system.instructionSet.instruction(system.line)!;
    expect(system.line.failed()).toBe(true);
    expect(system.line.failures.length).toBe(1);
    const failure = system.line.failures[0] as SupportFailure;
    expect(failure.kind).toBe("notSupported_mnemonic");
    expect(failure.used).toBe("EICALL");
    expect(failure.suggestion).toBe("ICALL");
    expect(result).toBe(undefined);
});

Deno.test("IJMP is offered as an alternative to EIJMP", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("plop"));
    system.instructionSet.unsupportedGroups(["flashMore128"]);
    system.line.mnemonic = "EIJMP";
    const result = system.instructionSet.instruction(system.line)!;
    expect(system.line.failed()).toBe(true);
    expect(system.line.failures.length).toBe(1);
    const failure = system.line.failures[0] as SupportFailure;
    expect(failure.kind).toBe("notSupported_mnemonic");
    expect(failure.used).toBe("EIJMP");
    expect(failure.suggestion).toBe("IJMP");
    expect(result).toBe(undefined);
});

Deno.test("DES has no alternative", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("plop"));
    system.instructionSet.unsupportedGroups(["DES"]);
    system.line.mnemonic = "DES";
    const result = system.instructionSet.instruction(system.line)!;
    expect(system.line.failed()).toBe(true);
    expect(system.line.failures.length).toBe(1);
    const failure = system.line.failures[0] as SupportFailure;
    expect(failure.kind).toBe("notSupported_mnemonic");
    expect(failure.used).toBe("DES");
    expect(failure.suggestion).toBe(undefined);
    expect(result).toBe(undefined);
});
