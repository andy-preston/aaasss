import { assert, assertEquals, assertFalse } from "assert";
import { assertSuccess } from "../failure/testing.ts";
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

Deno.test("Labels can be redefined on the second pass", () => {
    const environment = testEnvironment();
    environment.properties.setName("testDevice");
    environment.properties.programMemoryBytes(1024);
    const line = testLine("A_LABEL", [], []);

    environment.memory.origin(10);
    environment.memory.addressed(line);

    environment.pass.second();
    environment.memory.origin(10);
    const result = environment.memory.addressed(line);
    assertFalse(result.failed(), "Unexpected failure");
    const labelValue = environment.expression("A_LABEL");
    assertSuccess(labelValue, "10");
});

Deno.test("... but only once", () => {
    const environment = testEnvironment();
    environment.properties.setName("testDevice");
    environment.properties.programMemoryBytes(1024);
    const line = testLine("A_LABEL", [], []);

    environment.memory.origin(10);
    environment.memory.addressed(line);

    environment.pass.second();
    environment.memory.origin(10);
    environment.memory.addressed(line);
    const result = environment.memory.addressed(line);
    assert(result.failed(), "Unexpected success");
});
