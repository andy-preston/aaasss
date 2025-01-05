import { assert, assertEquals, assertFalse } from "assert";
import { deviceProperties } from "../device/properties.ts";
import { assertFailure } from "../failure/testing.ts";
import { anEmptyContext } from "../javascript/context.ts";
import { lineWithRenderedJavascript } from "../javascript/embedded/line-types.ts";
import { lineWithProcessedMacro } from "../macro/line-types.ts";
import type { NumericOperands, OperandTypes, SymbolicOperands } from "../operands/data-types.ts";
import { lineWithOperands } from "../operands/line-types.ts";
import { lineWithPokedBytes, lineWithAddress } from "../program-memory/line-types.ts";
import { programMemory } from "../program-memory/program-memory.ts";
import type { Label, Mnemonic } from "../source-code/data-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { objectCode } from "./object-code.ts";

const testEnvironment = () => {
    const context = anEmptyContext();
    const properties = deviceProperties(context);
    const memory = programMemory(context, properties.public);
    return {
        "properties": properties,
        "programMemory": memory,
        "objectCode": objectCode(properties.public, memory)
    };
};

const testLine = (
    label: Label, mnemonic: Mnemonic,
    symbolic: SymbolicOperands, numeric: NumericOperands, types: OperandTypes
) => {
    const raw = lineWithRawSource("", 0, false, "");
    const rendered = lineWithRenderedJavascript(raw, "");
    const tokenised = lineWithTokens(rendered, label, mnemonic, symbolic);
    const processed = lineWithProcessedMacro(tokenised, "");
    const addressed = lineWithAddress(processed, 0);
    const withOperands = lineWithOperands(addressed, numeric, types);
    return lineWithPokedBytes(withOperands, []);
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
    environment.properties.setName("testDevice");
    environment.properties.unsupportedInstructions(["DES"]);
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
    environment.properties.setName("testDevice");
    const line = testLine("", "NOT_REAL", [], [], []);
    const result = environment.objectCode(line);
    assert(result.failed());
    result.failures().forEach((failure, index) => {
        assertEquals(index, 0);
        assertFailure(failure, "mnemonic_unknown");
    });
    assertEquals(result.code.length, 0);
});

Deno.test("Insufficient program memory causes generation to fail", () => {
    const environment = testEnvironment();
    environment.properties.setName("testDevice");
    environment.properties.programMemoryBytes(0);
    const line = testLine("", "DES", ["15"], [15], ["number"]);
    const result = environment.objectCode(line);
    assert(result.failed(), "Didn't fail!");
    result.failures().forEach((failure, index) => {
        assertEquals(index, 0);
        assertFailure(failure, "programMemory_outOfRange");
    });
    // But, look, code is still generated
    assertEquals(result.code,[[0x94, 0xfb]]);
    //assertEquals(environment.programMemory.address(), 1);
});

Deno.test("Advancing beyond the end of program memory causes failure", () => {
    const environment = testEnvironment();
    environment.properties.setName("testDevice");
    environment.properties.programMemoryBytes(2);

    const firstLine = testLine("", "DES", ["15"], [15], ["number"]);
    const firstResult = environment.objectCode(firstLine);
    assertFalse(firstResult.failed(), "Unexpected failure");
    assertEquals(firstResult.failures.length, 0);
    assertEquals(firstResult.code,[[0x94, 0xfb]]);
    //assertEquals(environment.programMemory.address(), 1);

    const secondLine = testLine("", "DES", ["15"], [15], ["number"]);
    const secondResult = environment.objectCode(secondLine);
    assert(secondResult.failed(), "Didn't fail!");
    secondResult.failures().forEach((failure, index) => {
        assertEquals(index, 0);
        assertFailure(failure, "programMemory_outOfRange");
    });
    // But, look, code is still generated
    assertEquals(secondResult.code,[[0x94, 0xfb]]);
    //assertEquals(environment.programMemory.address(), 2);
});

Deno.test("Lines with real/supported instructions produce code", () => {
    const environment = testEnvironment();
    environment.properties.setName("testDevice");
    environment.properties.programMemoryBytes(1024);
    const line = testLine("", "DES", ["15"], [15], ["number"]);
    const result = environment.objectCode(line);
    assertFalse(result.failed(), "Unexpected failure");
    assertEquals(result.code,[[0x94, 0xfb]]);
    //assertEquals(environment.programMemory.address(), 1);
});
