import type { BoringFailure, ClueFailure, SupportFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("Unsupported instruction check fails when no device is selected", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().mnemonic = "MUL";
    const result = systemUnderTest.instructionSet.instruction()!;
    expect(systemUnderTest.currentLine().failures.length).toBe(2);
    {
        const failure = systemUnderTest.currentLine().failures[0] as BoringFailure;
        expect(failure.kind).toBe("device_notSelected");
    } {
        const failure = systemUnderTest.currentLine().failures[1] as ClueFailure;
        expect(failure.kind).toBe("mnemonic_supportedUnknown");
        expect(failure.clue).toBe("MUL");
    }
    expect(result.length).toBe(2);
    expect(typeof result[0]).toBe("string");
    expect(typeof result[1]).toBe("object");
});

Deno.test("Instructions are added to the unsupported list in groups", () => {
    ["LAC", "LAS", "LAT", "XCH"].forEach(mnemonic => {
        const systemUnderTest = testSystem();
        systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
        systemUnderTest.instructionSet.unsupportedGroups(["readModifyWrite"]);
        systemUnderTest.currentLine().mnemonic = mnemonic;
        const result = systemUnderTest.instructionSet.instruction();
        expect(systemUnderTest.currentLine().failures.length).toBe(1);
        const failure = systemUnderTest.currentLine().failures[0] as SupportFailure;
        expect(failure.kind).toBe("notSupported_mnemonic");
        expect(failure.used).toBe(mnemonic);
        expect(failure.suggestion).toBe(undefined);
        expect(failure.location).toBe(undefined);
        expect(result).toBe(undefined);
    });
    ["MUL", "MULS", "MULSU"].forEach(mnemonic => {
        const systemUnderTest = testSystem();
        systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
        systemUnderTest.instructionSet.unsupportedGroups(["readModifyWrite"]);
        systemUnderTest.currentLine().mnemonic = mnemonic;
        const result = systemUnderTest.instructionSet.instruction()!;
        expect(systemUnderTest.currentLine().failures.length).toBe(0);
        expect(systemUnderTest.currentLine().failures.length).toBe(0);
        expect(result.length).toBe(2);
        expect(typeof result[0]).toBe("string");
        expect(typeof result[1]).toBe("object");
    });
});

Deno.test("An unknown group throws an error", () => {
    const systemUnderTest = testSystem();
    expect(
        () => { systemUnderTest.instructionSet.unsupportedGroups(["plop"]); }
    ).toThrow<Error>(
        "Unknown unsupported instruction group: plop"
    );
});

Deno.test("Some unsupported instructions come with suggested alternatives", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.instructionSet.unsupportedGroups(["flashMore8"]);
    systemUnderTest.currentLine().mnemonic = "CALL";
    const result = systemUnderTest.instructionSet.instruction()!;
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as SupportFailure;
    expect(failure.kind).toBe("notSupported_mnemonic");
    expect(failure.used).toBe("CALL");
    expect(failure.suggestion).toBe("RCALL");
    expect(result).toBe(undefined);
});
