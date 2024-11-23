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
    const context = newContext();
    const device = deviceProperties(context);
    const programMemory = newProgramMemory(device);
    const generator = codeGenerator(context, device.public, programMemory);
    const line = testLine("", "", []);
    const result = generator(line);
    assertFalse(result.failed());
    assertEquals(result.failures.length, 0);
    assertEquals(result.code.length, 0);
});

Deno.test("Attempting to generate code with no device selected fails", () => {
    const context = newContext();
    const device = deviceProperties(context);
    const programMemory = newProgramMemory(device);
    const generator = codeGenerator(context, device.public, programMemory);
    const line = testLine("", "DES", []);
    const result = generator(line);
    assert(result.failed());
    assertEquals(result.failures.length, 1);
    assertEquals(result.failures[0]!.kind, "mnemonic.supportedUnknown");
    assertEquals(result.code.length, 0);
});

Deno.test("Lines with unsupported instructions fail", () => {
    const context = newContext();
    const device = deviceProperties(context);
    const programMemory = newProgramMemory(device);
    device.setName("testDevice");
    device.unsupportedInstructions(["DES"]);
    const generator = codeGenerator(context, device.public, programMemory);
    const line = testLine("", "DES", []);
    const result = generator(line);
    assert(result.failed());
    assertEquals(result.failures.length, 1);
    assertEquals(result.failures[0]!.kind, "mnemonic.notSupported");
    assertEquals(result.code.length, 0);
});

Deno.test("Lines with unknown instructions fail", () => {
    const context = newContext();
    const device = deviceProperties(context);
    const programMemory = newProgramMemory(device);
    device.setName("testDevice");
    const generator = codeGenerator(context, device.public, programMemory);
    const line = testLine("", "NOT_REAL", []);
    const result = generator(line);
    assert(result.failed());
    assertEquals(result.failures.length, 1);
    assertEquals(result.failures[0]!.kind, "mnemonic.unknown");
    assertEquals(result.code.length, 0);
});

Deno.test("Insufficient program memory causes generation to fail", () => {
    const context = newContext();
    const device = deviceProperties(context);
    const programMemory = newProgramMemory(device);
    device.setName("testDevice");
    device.programMemoryBytes(0);
    const generator = codeGenerator(context, device.public, programMemory);
    const line = testLine("", "DES", ["15"]);
    const result = generator(line);
    assert(result.failed(), "Didn't fail!");
    assertEquals(result.failures.length, 1);
    assertEquals(result.failures[0]!.kind, "programMemory.outOfRange");
    // But, look, code is still generated
    assertEquals(result.code.length, 2);
    assertEquals(programMemory.address(), 1);
});

Deno.test("Advancing beyond the end of program memory causes failure", () => {
    const context = newContext();
    const device = deviceProperties(context);
    const programMemory = newProgramMemory(device);
    device.setName("testDevice");
    device.programMemoryBytes(2);
    const generator = codeGenerator(context, device.public, programMemory);
    const line = testLine("", "DES", ["15"]);
    const firstResult = generator(line);
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
