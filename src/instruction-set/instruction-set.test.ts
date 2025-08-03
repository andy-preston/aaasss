import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("Unsupported instruction check fails when no device is selected", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().mnemonic = "MUL";
    const result = systemUnderTest.instructionSet.instruction()!;
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "device_notSelected", "location": undefined,
    }, {
        "kind": "mnemonic_supportedUnknown", "location": undefined,
        "clue": "MUL"
    }]);
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
        expect(systemUnderTest.currentLine().failures()).toEqual([{
            "kind": "notSupported_mnemonic", "location": undefined,
            "used": mnemonic, "suggestion": undefined
        }]);
        expect(result).toBe(undefined);
    });
    ["MUL", "MULS", "MULSU"].forEach(mnemonic => {
        const systemUnderTest = testSystem();
        systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
        systemUnderTest.instructionSet.unsupportedGroups(["readModifyWrite"]);
        systemUnderTest.currentLine().mnemonic = mnemonic;
        const result = systemUnderTest.instructionSet.instruction()!;
        expect(systemUnderTest.currentLine().failures()).toEqual([]);
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
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "notSupported_mnemonic", "location": undefined,
        "used": "CALL", "suggestion": "RCALL"
    }]);
    expect(result).toBe(undefined);
});
