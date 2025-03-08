import { assert, assertEquals, assertFalse } from "assert";
import { deviceProperties } from "../device/properties.ts";
import { assertFailureKind } from "../failure/testing.ts";
import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import { lineWithProcessedMacro } from "../macros/line-types.ts";
import type { NumericOperands, OperandTypes, SymbolicOperands } from "../operands/data-types.ts";
import { lineWithOperands } from "../operands/line-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import type { Label, Mnemonic } from "../tokens/data-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { objectCode } from "./object-code.ts";
import { pokeBuffer } from "./poke.ts";

const systemUnderTest = () => {
    const device = deviceProperties();
    return {
        "device": device,
        "objectCode": objectCode(device.public, pokeBuffer())
    };
};

const testLine = (
    label: Label, mnemonic: Mnemonic,
    symbolic: SymbolicOperands, numeric: NumericOperands, types: OperandTypes,
    isRecordingMacro: boolean,
) => {
    const raw = lineWithRawSource("", 0, "", "", 0, false);
    const rendered = lineWithRenderedJavascript(raw, "");
    const tokenised = lineWithTokens(rendered, label, mnemonic, symbolic);
    const processed = lineWithProcessedMacro(tokenised, isRecordingMacro);
    return lineWithOperands(processed, numeric, types);
};

Deno.test("Lines with no mnemonic don't bother generating code", () => {
    const system = systemUnderTest();
    const line = testLine("", "", [], [], [], false);
    const result = system.objectCode(line);
    assertFalse(result.failed());
    assertEquals(result.failures.length, 0);
    assertEquals(result.code.length, 0);
});

Deno.test("Attempting to generate code with no device selected fails", () => {
    const system = systemUnderTest();
    const line = testLine("", "DES", [], [], [], false);
    const result = system.objectCode(line);
    assert(result.failed());
    const failures = result.failures().toArray();
    assertEquals(failures.length, 1);
    assertFailureKind(failures, "mnemonic_supportedUnknown");
    assertEquals(result.code.length, 0);
});

Deno.test("Lines with unsupported instructions fail", () => {
    const system = systemUnderTest();
    system.device.property("deviceName", "test");
    system.device.unsupportedInstructions(["DES"]);
    const line = testLine("", "DES", [], [], [], false);
    const result = system.objectCode(line);
    assert(result.failed());
    const failures = result.failures().toArray();
    assertEquals(failures.length, 1);
    assertFailureKind(failures, "mnemonic_notSupported");
    assertEquals(result.code.length, 0);
});

Deno.test("Lines with unknown instructions fail", () => {
    const system = systemUnderTest();
    system.device.property("deviceName", "test");
    const line = testLine("", "NOT_REAL", [], [], [], false);
    const result = system.objectCode(line);
    assert(result.failed());
    const failures = result.failures().toArray();
    assertEquals(failures.length, 1);
    assertFailureKind(failures, "mnemonic_unknown");
    assertEquals(result.code.length, 0);
});

Deno.test("Lines with real/supported instructions produce code", () => {
    const system = systemUnderTest();
    system.device.property("deviceName", "test");
    const line = testLine("", "DES", ["15"], [15], ["number"], false);
    const result = system.objectCode(line);
    assertFalse(result.failed());
    assertEquals(result.code,[[0x94, 0xfb]]);
});

Deno.test("If a line has `isRecordingMacro == true`, no code is generated", () => {
    const system = systemUnderTest();
    system.device.property("deviceName", "test");
    const line = testLine("", "DES", ["15"], [15], ["number"], true);
    const result = system.objectCode(line);
    assertFalse(result.failed());
    assertEquals(result.code,[]);
});
