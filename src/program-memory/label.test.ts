import { assert, assertEquals, assertFalse } from "assert";
import { assertSuccess } from "../failure/testing.ts";
import { testEnvironment, testLine } from "./testing.ts";

Deno.test("A label is stored in the symbol table with the current address", () => {
    const environment = testEnvironment();
    environment.device.property("deviceName", "test");
    environment.device.property("programMemoryBytes", 1024);
    environment.memory.origin(10);

    const line = testLine("A_LABEL", [], []);
    const result = environment.memory.addressed(line);
    assertFalse(result.failed(), "Unexpected failure");
    assertEquals(result.failures.length, 0);
    assertEquals(environment.symbols.use("A_LABEL"), 10);
});

Deno.test("Labels can only be redefined if their value doesn't change", () => {
    const environment = testEnvironment();
    environment.device.property("deviceName", "test");
    environment.device.property("programMemoryBytes", 1024);
    const line = testLine("A_LABEL", [], []);

    environment.memory.origin(10);
    environment.memory.addressed(line);

    environment.pass.second();
    environment.memory.origin(10);
    const result1 = environment.memory.addressed(line);
    assertFalse(result1.failed(), "Unexpected failure");
    assertEquals(environment.symbols.use("A_LABEL"), 10);

    environment.memory.origin(20);
    const result2 = environment.memory.addressed(line);
    assert(result2.failed(), "Unexpected success");
    assertEquals(environment.symbols.use("A_LABEL"), 10);
});

Deno.test("Labels are available to javascript", () => {
    const environment = testEnvironment();
    environment.device.property("deviceName", "test");
    environment.device.property("programMemoryBytes", 1024);
    environment.pass.second();

    environment.memory.origin(10);
    environment.memory.addressed(testLine("A_LABEL", [], []));
    assertSuccess(environment.expression("A_LABEL"), "10");
});
