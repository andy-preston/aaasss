import { assert, assertEquals, assertFalse } from "jsr:@std/assert";
import { assertFailureKind } from "../failure/testing.ts";
import { systemUnderTest, testLine } from "./testing.ts";

Deno.test("If a line has no code the address remains unchanged", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");
    assertEquals(0, system.programMemory.address());
    system.programMemory.addressed(testLine("", [], []));
    assertEquals(0, system.programMemory.address());
});

Deno.test("The program counter advances by the number of words poked", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");
    assertEquals(0, system.programMemory.address());
    system.programMemory.addressed(testLine(
        "",
        [[1, 2, 3, 4], [5, 6]],
        []
    ));
    assertEquals(3, system.programMemory.address());
});

Deno.test("... or by the number of words of code", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");
    assertEquals(0, system.programMemory.address());
    system.programMemory.addressed(testLine("", [], [1, 2]));
    assertEquals(1, system.programMemory.address());
});

Deno.test("... or both", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");
    assertEquals(0, system.programMemory.address());
    system.programMemory.addressed(testLine("",
        [[1, 2, 3, 4], [5, 6]],
        [1, 2]
    ));
    const result = system.programMemory.address();
    assertEquals(4, result);
});

Deno.test("Insufficient program memory causes generation to fail", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "00");
    const preFailureAddress = system.programMemory.address();

    const line = testLine("", [[1, 2, 3, 4]], [1, 2]);
    const result = system.programMemory.addressed(line);
    assert(result.failed());
    const failures = result.failures().toArray();
    assertEquals(failures.length, 1);
    assertFailureKind(failures, "programMemory_outOfRange");
    // Code is still generated
    assertEquals(result.code, [[1, 2, 3, 4], [1, 2]]);
    // But the address doesn't advance
    assertEquals(system.programMemory.address(), preFailureAddress);
});

Deno.test("Advancing beyond the end of program memory causes failure", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "06");

    const firstLine = testLine("", [[1, 2, 3, 4]], [1, 2]);
    const firstResult = system.programMemory.addressed(firstLine);
    assertFalse(firstResult.failed());
    assertEquals(firstResult.failures.length, 0);
    assertEquals(firstResult.code, [[1, 2, 3, 4], [1, 2]]);
    const preFailureAddress = system.programMemory.address();

    const secondLine = testLine("", [[1, 2, 3, 4]], [1, 2]);
    const secondResult = system.programMemory.addressed(secondLine);
    assert(secondResult.failed(), "Didn't fail!");
    const failures = secondResult.failures().toArray();
    assertEquals(failures.length, 1);
    assertFailureKind(failures, "programMemory_outOfRange");
    // Code is still generated
    assertEquals(firstResult.code, [[1, 2, 3, 4], [1, 2]]);
    // But the address doesn't advance
    assertEquals(system.programMemory.address(), preFailureAddress);
});
