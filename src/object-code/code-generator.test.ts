import { assert, assertEquals, assertFalse } from "assert";
import { anEmptyContext } from "../context/context.ts";
import { deviceProperties } from "../device/properties.ts";
import { lineWithRenderedJavascript } from "../embedded-js/line-types.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import {
    lineWithPokedBytes, lineWithAddress
} from "../program-memory/line-types.ts";
import { programMemory } from "../program-memory/program-memory.ts";
import type { Label, Mnemonic } from "../source-code/data-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { codeGenerator } from "./code-generator.ts";
import { lineWithProcessedMacro } from "../macro/line-types.ts";

const testEnvironment = () => {
    const context = anEmptyContext();
    const properties = deviceProperties(context);
    const memory = programMemory(context, properties.public);
    return {
        "context": context,
        "properties": properties,
        "programMemory": memory,
        "generator": codeGenerator(context, properties.public, memory)
    };
};

const testLine = (
    label: Label, mnemonic: Mnemonic, operands: SymbolicOperands
) => {
    const raw = lineWithRawSource("", 0, false, "");
    const rendered = lineWithRenderedJavascript(raw, "");
    const tokenised = lineWithTokens(rendered, label, mnemonic, operands, []);
    const processed = lineWithProcessedMacro(tokenised, "", []);
    const addressed = lineWithAddress(processed, 0, []);
    return lineWithPokedBytes(addressed, [], []);
};

Deno.test("Lines with no mnemonic don't bother generating code", () => {
    const environment = testEnvironment();
    const result = environment.generator(testLine("", "", []));
    assertFalse(result.failed());
    assertEquals(result.failures.length, 0);
    assertEquals(result.code.length, 0);
});

Deno.test("Attempting to generate code with no device selected fails", () => {
    const environment = testEnvironment();
    const result = environment.generator(testLine("", "DES", []));
    assert(result.failed());
    assertEquals(result.failures.length, 1);
    assertEquals(result.failures[0]!.kind, "mnemonic_supportedUnknown");
    assertEquals(result.code.length, 0);
});

Deno.test("Lines with unsupported instructions fail", () => {
    const environment = testEnvironment();
    environment.properties.setName("testDevice");
    environment.properties.unsupportedInstructions(["DES"]);
    const result = environment.generator(testLine("", "DES", []));
    assert(result.failed());
    assertEquals(result.failures.length, 1);
    assertEquals(result.failures[0]!.kind, "mnemonic_notSupported");
    assertEquals(result.code.length, 0);
});

Deno.test("Lines with unknown instructions fail", () => {
    const environment = testEnvironment();
    environment.properties.setName("testDevice");
    const result = environment.generator(testLine("", "NOT_REAL", []));
    assert(result.failed());
    assertEquals(result.failures.length, 1);
    assertEquals(result.failures[0]!.kind, "mnemonic_unknown");
    assertEquals(result.code.length, 0);
});

Deno.test("Insufficient program memory causes generation to fail", () => {
    const environment = testEnvironment();
    environment.properties.setName("testDevice");
    environment.properties.programMemoryBytes(0);
    const result = environment.generator(testLine("", "DES", ["15"]));
    assert(result.failed(), "Didn't fail!");
    assertEquals(result.failures.length, 1);
    assertEquals(result.failures[0]!.kind, "programMemory_outOfRange");
    // But, look, code is still generated
    assertEquals(result.code,[[0x94, 0xfb]]);
    //assertEquals(environment.programMemory.address(), 1);
});

Deno.test("Advancing beyond the end of program memory causes failure", () => {
    const environment = testEnvironment();
    environment.properties.setName("testDevice");
    environment.properties.programMemoryBytes(2);

    const firstResult = environment.generator(testLine("", "DES", ["15"]));
    assertFalse(firstResult.failed(), "Unexpected failure");
    assertEquals(firstResult.failures.length, 0);
    assertEquals(firstResult.code,[[0x94, 0xfb]]);
    //assertEquals(environment.programMemory.address(), 1);

    const secondResult = environment.generator(testLine("", "DES", ["15"]));
    assert(secondResult.failed(), "Didn't fail!");
    assertEquals(secondResult.failures.length, 1);
    assertEquals(secondResult.failures[0]!.kind, "programMemory_outOfRange");
    // But, look, code is still generated
    assertEquals(secondResult.code,[[0x94, 0xfb]]);
    //assertEquals(environment.programMemory.address(), 2);
});

Deno.test("Lines with real/supported instructions produce code", () => {
    const environment = testEnvironment();
    environment.properties.setName("testDevice");
    environment.properties.programMemoryBytes(1024);
    const result = environment.generator(testLine("", "DES", ["15"]));
    assertFalse(result.failed(), "Unexpected failure");
    assertEquals(result.failures.length, 0);
    assertEquals(result.code,[[0x94, 0xfb]]);
    //assertEquals(environment.programMemory.address(), 1);
});
