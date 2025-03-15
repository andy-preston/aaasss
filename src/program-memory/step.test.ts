import { assert, assertEquals, assertFalse } from "assert";
import type { MemoryRangeFailure } from "../failure/bags.ts";
import type { Code } from "../object-code/data-types.ts";
import { systemUnderTest, testLine } from "./testing.ts";

/*
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
    const testPokes: Code = [1, 2, 3, 4];
    const testCode: Code = [1, 2];

    const line = testLine("", [testPokes], testCode);
    const result = system.programMemory.addressed(line);
    assert(result.failed());
    const failures = result.failures().toArray();
    assertEquals(failures.length, 1);
    assertEquals(failures[0]!.kind, "programMemory_outOfRange");
    const failure = failures[0] as MemoryRangeFailure;
    assertEquals(failure.bytesAvailable, 0);
    assertEquals(failure.bytesRequested, testPokes.length + testCode.length);
    // Code is still generated
    assertEquals(result.code, [testPokes, testCode]);
    // But the address doesn't advance
    assertEquals(system.programMemory.address(), preFailureAddress);
});
*/

Deno.test("Advancing beyond the end of program memory causes failure", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "06");
    const testPokes: Code = [1, 2, 3, 4];
    const testCode: Code = [1, 2];

    const firstLine = testLine("", [testPokes], testCode);
    const firstResult = system.programMemory.addressed(firstLine);
    assertFalse(firstResult.failed());
    assertEquals(firstResult.failures.length, 0);
    assertEquals(firstResult.code, [testPokes, testCode]);
    const preFailureAddress = system.programMemory.address();
    assertEquals(preFailureAddress * 2, testPokes.length + testCode.length);

    const secondLine = testLine("", [testPokes], testCode);
    const secondResult = system.programMemory.addressed(secondLine);
    assert(secondResult.failed(), "Didn't fail!");
    const failures = secondResult.failures().toArray();
    assertEquals(failures.length, 1);
    assertEquals(failures[0]!.kind, "programMemory_outOfRange");
    const failure = failures[0] as MemoryRangeFailure;
    assertEquals(failure.bytesAvailable, 0);
    assertEquals(failure.bytesRequested, testPokes.length + testCode.length);
    // Code is still generated
    assertEquals(firstResult.code, [testPokes, testCode]);
    // But the address doesn't advance
    assertEquals(system.programMemory.address(), preFailureAddress);
});
