import { assert, assertEquals, assertFalse } from "assert";
import { deviceProperties } from "../device/properties.ts";
import { assertFailure } from "../failure/testing.ts";
import { lineWithRenderedJavascript } from "../javascript/line-types.ts";
import { lineWithProcessedMacro } from "../macros/line-types.ts";
import type { NumericOperands, OperandTypes, SymbolicOperands } from "../operands/data-types.ts";
import { lineWithOperands } from "../operands/line-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import type { Label, Mnemonic } from "../tokens/data-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { objectCode } from "./object-code.ts";
import { pokeBuffer } from "./poke.ts";

const testEnvironment = () => {
    const device = deviceProperties();
    return {
        "device": device,
        "objectCode": objectCode(device.public, pokeBuffer())
    };
};

const testLine = (
    label: Label, mnemonic: Mnemonic,
    symbolic: SymbolicOperands, numeric: NumericOperands, types: OperandTypes
) => {
    const raw = lineWithRawSource("", 0, false, "");
    const rendered = lineWithRenderedJavascript(raw, "");
    const tokenised = lineWithTokens(rendered, label, mnemonic, symbolic);
    const processed = lineWithProcessedMacro(tokenised, false);
    return lineWithOperands(processed, numeric, types);
};

Deno.test("Lines with no mnemonic don't bother generating code", () => {
    const environment = testEnvironment();
    const line = testLine("", "", [], [], []);
    const result = environment.objectCode(line);
    assertFalse(result.failed());
    assertEquals(result.failures.length, 0);
    assertEquals(result.code.length, 0);
});

Deno.test("Attempting to generate code with no device selected fails", () => {
    const environment = testEnvironment();
    const line = testLine("", "DES", [], [], []);
    const result = environment.objectCode(line);
    assert(result.failed());
    result.failures().forEach((failure, index) => {
        assertEquals(index, 0);
        assertFailure(failure, "mnemonic_supportedUnknown");
    });
    assertEquals(result.code.length, 0);
});

Deno.test("Lines with unsupported instructions fail", () => {
    const environment = testEnvironment();
    environment.device.property("deviceName", "test");
    environment.device.unsupportedInstructions(["DES"]);
    const line = testLine("", "DES", [], [], []);
    const result = environment.objectCode(line);
    assert(result.failed());
    result.failures().forEach((failure, index) => {
        assertEquals(index, 0);
        assertFailure(failure, "mnemonic_notSupported");
    });
    assertEquals(result.code.length, 0);
});

Deno.test("Lines with unknown instructions fail", () => {
    const environment = testEnvironment();
    environment.device.property("deviceName", "test");
    const line = testLine("", "NOT_REAL", [], [], []);
    const result = environment.objectCode(line);
    assert(result.failed());
    result.failures().forEach((failure, index) => {
        assertEquals(index, 0);
        assertFailure(failure, "mnemonic_unknown");
    });
    assertEquals(result.code.length, 0);
});

Deno.test("Lines with real/supported instructions produce code", () => {
    const environment = testEnvironment();
    environment.device.property("deviceName", "test");
    const line = testLine("", "DES", ["15"], [15], ["number"]);
    const result = environment.objectCode(line);
    assertFalse(result.failed(), "Unexpected failure");
    assertEquals(result.code,[[0x94, 0xfb]]);
});
