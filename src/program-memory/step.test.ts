import { assert, assertEquals, assertFalse } from "assert";
import { assertFailure } from "../failure/testing.ts";
import { testEnvironment, testLine } from "./testing.ts";

Deno.test("If a line has no code the address remains unchanged", () => {
    const environment = testEnvironment();
    environment.device.property("deviceName", "test");
    environment.device.property("programMemoryBytes", "FF");
    assertEquals(0, environment.memory.address());
    environment.memory.addressed(testLine("", [], []));
    assertEquals(0, environment.memory.address());
});

Deno.test("The program counter advances by the number of words poked", () => {
    const environment = testEnvironment();
    environment.device.property("deviceName", "test");
    environment.device.property("programMemoryBytes", "FF");
    assertEquals(0, environment.memory.address());
    environment.memory.addressed(testLine(
        "",
        [[1, 2, 3, 4], [5, 6]],
        []
    ));
    assertEquals(3, environment.memory.address());
});

Deno.test("... or by the number of words of code", () => {
    const environment = testEnvironment();
    environment.device.property("deviceName", "test");
    environment.device.property("programMemoryBytes", "FF");
    assertEquals(0, environment.memory.address());
    environment.memory.addressed(testLine("", [], [1, 2]));
    assertEquals(1, environment.memory.address());
});

Deno.test("... or both", () => {
    const environment = testEnvironment();
    environment.device.property("deviceName", "test");
    environment.device.property("programMemoryBytes", "FF");
    assertEquals(0, environment.memory.address());
    environment.memory.addressed(testLine("",
        [[1, 2, 3, 4], [5, 6]],
        [1, 2]
    ));
    const result = environment.memory.address();
    assertEquals(4, result);
});

Deno.test("Insufficient program memory causes generation to fail", () => {
    const environment = testEnvironment();
    environment.device.property("deviceName", "test");
    environment.device.property("programMemoryBytes", "00");
    const line = testLine("", [[1, 2, 3, 4]], [1, 2]);
    const result = environment.memory.addressed(line);
    assert(result.failed(), "Didn't fail!");
    result.failures().forEach((failure, index) => {
        assertEquals(index, 0);
        assertFailure(failure, "programMemory_outOfRange");
    });
    // But, look, code is still generated
    assertEquals(result.code, [[1, 2, 3, 4], [1, 2]]);
    //assertEquals(environment.programMemory.address(), 1);
});

Deno.test("Advancing beyond the end of program memory causes failure", () => {
    const environment = testEnvironment();
    environment.device.property("deviceName", "test");
    environment.device.property("programMemoryBytes", "06");

    const firstLine = testLine("", [[1, 2, 3, 4]], [1, 2]);
    const firstResult = environment.memory.addressed(firstLine);
    assertFalse(firstResult.failed(), "Unexpected failure");
    assertEquals(firstResult.failures.length, 0);
    assertEquals(firstResult.code, [[1, 2, 3, 4], [1, 2]]);
    //assertEquals(environment.programMemory.address(), 1);

    const secondLine = testLine("", [[1, 2, 3, 4]], [1, 2]);
    const secondResult = environment.memory.addressed(secondLine);
    assert(secondResult.failed(), "Didn't fail!");
    secondResult.failures().forEach((failure, index) => {
        assertEquals(index, 0);
        assertFailure(failure, "programMemory_outOfRange");
    });
    // But, look, code is still generated
    assertEquals(firstResult.code, [[1, 2, 3, 4], [1, 2]]);
    //assertEquals(environment.programMemory.address(), 2);
});
