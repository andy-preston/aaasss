import type { Failure, SupportFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { stringBag } from "../assembler/bags.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("Unsupported instructions fails when no device is selected", () => {
    const system = systemUnderTest();
    const result = system.instructionSet.isUnsupported("MUL");
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(2);
    expect(failures[0]!.kind).toBe("device_notSelected");
    expect(failures[1]!.kind).toBe("mnemonic_supportedUnknown");
});

Deno.test("Returns default unsupported instruction flags once a device name is selected", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("imaginaryDevice"));
    const result = system.instructionSet.isUnsupported("MUL");
    expect(result.type).toBe("boolean");
    expect(result.it).toBe(false);
});

Deno.test("Instructions are added to the unsupported list in groups", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("imaginaryDevice"));
    system.instructionSet.unsupportedGroups(["readModifyWrite"]);
    for (const mnemonic of ["LAC", "LAS", "LAT", "XCH"]) {
        const result = system.instructionSet.isUnsupported(mnemonic);
        expect(result.type).toBe("failures");
        const failures = result.it as Array<Failure>;
        expect (failures.length).toBe(1);
        const failure = failures[0] as SupportFailure;
        expect (failure.kind).toBe("notSupported_mnemonic");
        expect(failure.used).toBe(mnemonic);
        expect(failure.suggestion).toBe(undefined);
        expect(failure.location).toBe(undefined);
    }
    for (const mnemonic of ["MUL", "MULS", "MULSU"]) {
        const result = system.instructionSet.isUnsupported(mnemonic);
        expect(result.type).toBe("boolean");
        expect(result.it).toBe(false);
    }
});

Deno.test("An unknown group throws an error", () => {
    const system = systemUnderTest();
    // cSpell:words wibbly-wobbly
    expect(
        () => { system.instructionSet.unsupportedGroups(["wibbly-wobbly"]); }
    ).toThrow<Error>(
        "Unknown unsupported instruction group: wibbly-wobbly"
    );
});
