import { expect } from "jsr:@std/expect";
import { systemUnderTest, testLine } from "./testing.ts";

Deno.test("If a line has no code the address remains unchanged", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");
    expect(system.programMemory.address()).toBe(0);
    system.programMemory.addressed(testLine("", [], []));
    expect(system.programMemory.address()).toBe(0);
});

Deno.test("The program counter advances by the number of words poked", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");
    expect(system.programMemory.address()).toBe(0);
    system.programMemory.addressed(testLine(
        "",
        [[1, 2, 3, 4], [5, 6]],
        []
    ));
    expect(system.programMemory.address()).toBe(3);
});

Deno.test("... or by the number of words of code", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");
    expect(system.programMemory.address()).toBe(0);
    system.programMemory.addressed(testLine("", [], [1, 2]));
    expect(system.programMemory.address()).toBe(1);
});

Deno.test("... or both", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");
    expect(system.programMemory.address()).toBe(0);
    system.programMemory.addressed(testLine("",
        [[1, 2, 3, 4], [5, 6]],
        [1, 2]
    ));
    const result = system.programMemory.address();
    expect(result).toBe(4);
});

Deno.test("Insufficient program memory causes generation to fail", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "00");
    const preFailureAddress = system.programMemory.address();

    const line = testLine("", [[1, 2, 3, 4]], [1, 2]);
    const result = system.programMemory.addressed(line);
    expect(result.failed()).toBeTruthy();
    const failures = result.failures().toArray();
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("programMemory_outOfRange");

    // Code is still generated
    expect(result.code).toEqual([[1, 2, 3, 4], [1, 2]]);
    // But the address doesn't advance
    expect(system.programMemory.address()).toBe(preFailureAddress);
});

Deno.test("Advancing beyond the end of program memory causes failure", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "06");

    const firstLine = testLine("", [[1, 2, 3, 4]], [1, 2]);
    const firstResult = system.programMemory.addressed(firstLine);
    expect(firstResult.failed()).toBeFalsy();
    expect(firstResult.failures.length).toBe(0);
    expect(firstResult.code).toEqual([[1, 2, 3, 4], [1, 2]]);
    const preFailureAddress = system.programMemory.address();

    const secondLine = testLine("", [[1, 2, 3, 4]], [1, 2]);
    const secondResult = system.programMemory.addressed(secondLine);
    expect(secondResult.failed(), "Didn't fail!").toBeTruthy();
    const failures = secondResult.failures().toArray();
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("programMemory_outOfRange");

    // Code is still generated
    expect(firstResult.code).toEqual([[1, 2, 3, 4], [1, 2]]);
    // But the address doesn't advance
    expect(system.programMemory.address()).toBe(preFailureAddress);
});
