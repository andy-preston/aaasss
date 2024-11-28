import { assert, assertEquals, assertFalse } from "assert";
import { newContext } from "../context/context.ts";
import {
    rawLine, assemblyLine, tokenisedLine, addressedLine, pokedLine,
    type Label, type Mnemonic, type SymbolicOperands, type PokedLine
} from "../coupling/line.ts";
import { deviceProperties } from "../device/properties.ts";
import { newProgramMemory } from "../program-memory/program-memory.ts";
import { codeGenerator } from "./code-generator.ts";

const testEnvironment = () => {
    const context = newContext();
    const device = deviceProperties(context);
    const programMemory = newProgramMemory(context, device);
    return {
        "context": context,
        "device": device,
        "programMemory": programMemory,
        "generator": codeGenerator(context, device.public, programMemory)
    };
};

const testLine = (
    label: Label, mnemonic: Mnemonic, operands: SymbolicOperands
): PokedLine => {
    const raw = rawLine("", 0, "", []);
    const assembly = assemblyLine(raw, "", []);
    const tokenised = tokenisedLine(assembly, label, mnemonic, operands, []);
    const addressed = addressedLine(tokenised, 0, []);
    return pokedLine(addressed, [], []);
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
    assertEquals(result.failures[0]!.kind, "mnemonic.supportedUnknown");
    assertEquals(result.code.length, 0);
});

Deno.test("Lines with unsupported instructions fail", () => {
    const environment = testEnvironment();
    environment.device.setName("testDevice");
    environment.device.unsupportedInstructions(["DES"]);
    const result = environment.generator(testLine("", "DES", []));
    assert(result.failed());
    assertEquals(result.failures.length, 1);
    assertEquals(result.failures[0]!.kind, "mnemonic.notSupported");
    assertEquals(result.code.length, 0);
});

Deno.test("Lines with unknown instructions fail", () => {
    const environment = testEnvironment();
    environment.device.setName("testDevice");
    const result = environment.generator(testLine("", "NOT_REAL", []));
    assert(result.failed());
    assertEquals(result.failures.length, 1);
    assertEquals(result.failures[0]!.kind, "mnemonic.unknown");
    assertEquals(result.code.length, 0);
});

Deno.test("Insufficient program memory causes generation to fail", () => {
    const environment = testEnvironment();
    environment.device.setName("testDevice");
    environment.device.programMemoryBytes(0);
    const result = environment.generator(testLine("", "DES", ["15"]));
    assert(result.failed(), "Didn't fail!");
    assertEquals(result.failures.length, 1);
    assertEquals(result.failures[0]!.kind, "programMemory.outOfRange");
    // But, look, code is still generated
    assertEquals(result.code,[[0x94, 0xfb]]);
    //assertEquals(environment.programMemory.address(), 1);
});

Deno.test("Advancing beyond the end of program memory causes failure", () => {
    const environment = testEnvironment();
    environment.device.setName("testDevice");
    environment.device.programMemoryBytes(2);

    const firstResult = environment.generator(testLine("", "DES", ["15"]));
    assertFalse(firstResult.failed(), "Unexpected failure");
    assertEquals(firstResult.failures.length, 0);
    assertEquals(firstResult.code,[[0x94, 0xfb]]);
    //assertEquals(environment.programMemory.address(), 1);

    const secondResult = environment.generator(testLine("", "DES", ["15"]));
    assert(secondResult.failed(), "Didn't fail!");
    assertEquals(secondResult.failures.length, 1);
    assertEquals(secondResult.failures[0]!.kind, "programMemory.outOfRange");
    // But, look, code is still generated
    assertEquals(secondResult.code,[[0x94, 0xfb]]);
    //assertEquals(environment.programMemory.address(), 2);
});

Deno.test("Lines with real/supported instructions produce code", () => {
    const environment = testEnvironment();
    environment.device.setName("testDevice");
    environment.device.programMemoryBytes(1024);
    const result = environment.generator(testLine("", "DES", ["15"]));
    assertFalse(result.failed(), "Unexpected failure");
    assertEquals(result.failures.length, 0);
    assertEquals(result.code,[[0x94, 0xfb]]);
    //assertEquals(environment.programMemory.address(), 1);
});
