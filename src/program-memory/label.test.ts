import { assert, assertEquals, assertFalse } from "assert";
import { newContext } from "../context/context.ts";
import {
    assemblyLine, rawLine, tokenisedLine, type Label, type TokenisedLine
} from "../coupling/line.ts";
import { deviceProperties } from "../device/properties.ts";
import { Box } from "../value-or-failure.ts";
import { newProgramMemory } from "./program-memory.ts";
import { passes } from "../pass/pass.ts";

const testEnvironment = () => {
    const context = newContext();
    const device = deviceProperties(context);
    return {
        "context": context,
        "device": device,
        "programMemory": newProgramMemory(context, device),
    };
};

const testLine = (label: Label): TokenisedLine => {
    const raw = rawLine("", 0, "", []);
    const assembly = assemblyLine(raw, "", []);
    return tokenisedLine(assembly, label, "", [], []);
};

Deno.test("A label is stored in the context with the current address", () => {
    const environment = testEnvironment();
    environment.device.setName("testDevice");
    environment.device.programMemoryBytes(1024);
    environment.programMemory.origin(10);
    const result = environment.programMemory.label(testLine("A_LABEL"));
    assertFalse(result.failed(), "Unexpected failure");
    assertEquals(result.failures.length, 0);
    const labelValue = environment.context.value("A_LABEL");
    assertEquals(labelValue.which, "box");
    assertEquals((labelValue as Box<string>).value, "10");
});

Deno.test("Labels can be defined on multiple passes but must keep the same address", () => {
    const environment = testEnvironment();
    environment.device.setName("testDevice");
    environment.device.programMemoryBytes(1024);
    environment.programMemory.origin(10);
    for (const _pass of passes) {
        const result = environment.programMemory.label(testLine("A_LABEL"));
        assertFalse(result.failed(), "Unexpected failure");
        assertEquals(result.failures.length, 0);
        const labelValue = environment.context.value("A_LABEL");
        assertEquals(labelValue.which, "box");
        assertEquals((labelValue as Box<string>).value, "10");
    }
});

Deno.test("... but will cause a failure if the address changes", () => {
    const environment = testEnvironment();
    environment.device.setName("testDevice");
    environment.device.programMemoryBytes(1024);

    environment.programMemory.origin(10);
    const firstResult = environment.programMemory.label(testLine("A_LABEL"));
    assertFalse(firstResult.failed(), "Unexpected failure");
    assertEquals(firstResult.failures.length, 0);

    environment.programMemory.origin(20);
    const secondResult = environment.programMemory.label(testLine("A_LABEL"));
    assert(secondResult.failed(), "Unexpected success");
    assertEquals(secondResult.failures.length, 1);
    const failure = secondResult.failures[0]!;
    assertEquals(failure.kind, "context.redefined");
    assertEquals(failure.extra, "10");
});
