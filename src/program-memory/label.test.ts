import { assert, assertEquals, assertFalse } from "assert";
import { passes } from "../assembler/pass.ts";
import { assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { testEnvironment, testLine } from "./testing.ts";

Deno.test("A label is stored in the context with the current address", () => {
    const environment = testEnvironment();
    environment.properties.setName("testDevice");
    environment.properties.programMemoryBytes(1024);
    environment.memory.origin(10);

    const line = testLine("A_LABEL", [], []);
    const result = environment.memory.addressed(line);
    assertFalse(result.failed(), "Unexpected failure");
    assertEquals(result.failures.length, 0);

    const labelValue = environment.expression("A_LABEL");
    assertSuccess(labelValue, "10");
});

Deno.test("Labels can be defined on multiple passes but must keep the same address", () => {
    const environment = testEnvironment();
    environment.properties.setName("testDevice");
    environment.properties.programMemoryBytes(1024);
    environment.memory.origin(10);
    for (const _pass of passes) {
        const line = testLine("A_LABEL", [], []);
        const result = environment.memory.addressed(line);
        assertFalse(result.failed(), "Unexpected failure");
        assertEquals(result.failures.length, 0);

        const labelValue = environment.expression("A_LABEL");
        assertSuccess(labelValue, "10");
    }
});

Deno.test("... but will cause a failure if the address changes", () => {
    const environment = testEnvironment();
    environment.properties.setName("testDevice");
    environment.properties.programMemoryBytes(1024);

    environment.memory.origin(10);
    const firstLine = testLine("A_LABEL", [], []);
    const firstResult = environment.memory.addressed(firstLine);
    assertFalse(firstResult.failed(), "Unexpected failure");
    assertEquals(firstResult.failures.length, 0);

    environment.memory.origin(20);
    const secondLine = testLine("A_LABEL", [], []);
    const secondResult = environment.memory.addressed(secondLine);
    assert(secondResult.failed(), "Unexpected success");
    secondResult.failures().forEach((failure, index) => {
        assertEquals(index, 0);
        assertFailureWithExtra(failure, "context_redefined", "10");
    });
});
