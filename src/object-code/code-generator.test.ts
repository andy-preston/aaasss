import type { BoringFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { stringBag } from "../assembler/bags.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("Lines with no mnemonic don't bother generating code", () => {
    const system = systemUnderTest({
        "label": "", "mnemonic": "",
        "symbolicOperands": [], "numericOperands": [],
        "operandTypes": [], "isRecordingMacro": false
    });
    const result = system.assemblyPipeline.next().value!;
    expect(result.failed()).toBeFalsy();
    expect(result.failures.length).toBe(0);
    expect(result.code.length).toBe(0);
});

Deno.test("Attempting to generate code with no device selected fails", () => {
    const system = systemUnderTest({
        "label": "", "mnemonic": "DES",
        "symbolicOperands": [], "numericOperands": [],
        "operandTypes": [], "isRecordingMacro": false
    });
    const result = system.assemblyPipeline.next().value!;
    expect(result.failed()).toBeTruthy();
    const failures = [...result.failures()];
    expect(failures.length).toBe(2);
    expect(failures[0]!.kind).toBe("device_notSelected");
    expect(failures[1]!.kind).toBe("mnemonic_supportedUnknown");
    expect(result.code.length).toBe(0);
});

Deno.test("Lines with unsupported instructions fail", () => {
    const system = systemUnderTest({
        "label": "", "mnemonic": "DES",
        "symbolicOperands": [], "numericOperands": [],
        "operandTypes": [], "isRecordingMacro": false
    });
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.instructionSet.unsupportedGroups(["DES"]);
    const result = system.assemblyPipeline.next().value!;
    expect(result.failed()).toBeTruthy();
    const failures = [...result.failures()];
    expect(failures.length).toBe(1);
    const failure = failures[0] as BoringFailure;
    expect(failure.kind).toBe("mnemonic_notSupported");
    expect(result.code.length).toBe(0);
});

Deno.test("Lines with unknown instructions fail", () => {
    const system = systemUnderTest({
        "label": "", "mnemonic": "NOT_REAL",
        "symbolicOperands": [], "numericOperands": [],
        "operandTypes": [], "isRecordingMacro": false
    });
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    const result = system.assemblyPipeline.next().value!;
    expect(result.failed()).toBeTruthy();
    const failures = [...result.failures()];
    expect(failures.length).toBe(1);
    const failure = failures[0] as BoringFailure;
    expect(failure.kind).toBe("mnemonic_unknown");
    expect(result.code.length).toBe(0);
});

Deno.test("Lines with real/supported instructions produce code", () => {
    const system = systemUnderTest({
        "label": "", "mnemonic": "DES",
        "symbolicOperands": ["15"], "numericOperands": [15],
        "operandTypes": ["number"], "isRecordingMacro": false
    });
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    const result = system.assemblyPipeline.next().value!;
    expect(result.failed()).toBeFalsy();
    expect(result.code).toEqual([[0x94, 0xfb]]);
});

Deno.test("If a line has `isRecordingMacro == true`, no code is generated", () => {
    const system = systemUnderTest({
        "label": "", "mnemonic": "DES",
        "symbolicOperands": ["15"], "numericOperands": [15],
        "operandTypes": ["number"], "isRecordingMacro": true
    });
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    const result = system.assemblyPipeline.next().value!;
    expect(result.failed()).toBeFalsy();
    expect(result.code.length).toBe(0);
});
