import { assert, assertEquals, assertFalse } from "assert";
import { newContext } from "../context/context.ts";
import {
    assemblyLine, rawLine, tokenisedLine,
    type Label, type Mnemonic, type TokenisedLine, type SymbolicOperands
} from "../coupling/line.ts";
import { deviceProperties } from "../device/properties.ts";
import { newProgramMemory } from "../state/program-memory.ts";
import type { Box } from "../value-or-failure.ts";
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
    label: Label,
    mnemonic: Mnemonic,
    operands: SymbolicOperands
): TokenisedLine => tokenisedLine(
    assemblyLine(
        rawLine("", 0, "", []),
        "", []
    ),
    label, mnemonic, operands, []
);

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
    assertEquals(result.code.length, 2);
    assertEquals(programMemory.address(), 1);
});

Deno.test("Advancing beyond the end of program memory causes failure", () => {
    const environment = testEnvironment();
    environment.device.setName("testDevice");
    environment.device.programMemoryBytes(2);

    const firstResult = environment.generator(testLine("", "DES", ["15"]));
    assertFalse(firstResult.failed(), "Unexpected failure");
    assertEquals(firstResult.failures.length, 0);
    assertEquals(firstResult.code.length, 2);
    assertEquals(programMemory.address(), 1);
    const secondResult = generator(line);
    assert(secondResult.failed(), "Didn't fail!");
    assertEquals(secondResult.failures.length, 1);
    assertEquals(secondResult.failures[0]!.kind, "programMemory.outOfRange");
    // But, look, code is still generated
    assertEquals(secondResult.code.length, 2);
    assertEquals(programMemory.address(), 2);
});

Deno.test("Lines with real/supported instructions produce code", () => {
    const context = newContext();
    const device = deviceProperties(context);
    const programMemory = newProgramMemory(device);
    device.setName("testDevice");
    device.programMemoryBytes(1024);
    const generator = codeGenerator(context, device.public, programMemory);
    const line = testLine("", "DES", ["15"]);
    const result = generator(line);
    assertFalse(result.failed(), "Unexpected failure");
    assertEquals(result.failures.length, 0);
    assertEquals(result.code.length, 2);
    assertEquals(result.code, [0x94, 0xfb]);
    assertEquals(programMemory.address(), 1);
});

Deno.test("A label is set to the current program memory address", () => {
    const context = newContext();
    const device = deviceProperties(context);
    const programMemory = newProgramMemory(device);
    device.setName("testDevice");
    device.programMemoryBytes(1024);
    programMemory.origin(10);
    const generator = codeGenerator(context, device.public, programMemory);
    const line = testLine("A_LABEL", "DES", ["15"]);
    const result = generator(line);
    assertFalse(result.failed(), "Unexpected failure");
    assertEquals(result.failures.length, 0);
    assertEquals(result.code.length, 2);
    assertEquals(programMemory.address(), 11);
    const theLabel = context.value("A_LABEL");
    assertEquals(theLabel.which, "box");
    assertEquals((theLabel as Box<string>).value, "10");
});

Deno.test("A line with just a label, still sets a value", () => {
    const context = newContext();
    const device = deviceProperties(context);
    const programMemory = newProgramMemory(device);
    device.setName("testDevice");
    device.programMemoryBytes(1024);
    programMemory.origin(10);
    const generator = codeGenerator(context, device.public, programMemory);
    const line = testLine("A_LABEL", "", [""]);
    const result = generator(line);
    assertFalse(result.failed(), "Unexpected failure");
    assertEquals(result.failures.length, 0);
    assertEquals(result.code.length, 0);
    assertEquals(programMemory.address(), 10);
    const theLabel = context.value("A_LABEL");
    assertEquals(theLabel.which, "box");
    assertEquals((theLabel as Box<string>).value, "10");
});
