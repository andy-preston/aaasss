import { expect } from "jsr:@std/expect";
import { systemUnderTest, testPipeline } from "./testing.ts";
import { numberBag, stringBag } from "../assembler/bags.ts";

Deno.test("If a line has no code the address remains unchanged", () => {
    const system = systemUnderTest();
    const pipeline = testPipeline(
        system, {"label": "", "code": []}
    );
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));

    expect(system.programMemory.address()).toBe(0);
    [...pipeline];
    expect(system.programMemory.address()).toBe(0);
});

Deno.test("The program counter advances by the number of words of code", () => {
    const system = systemUnderTest();
    const pipeline = testPipeline(
        system, {"label": "", "code": [1, 2, 3, 4, 5, 6]}
    );
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));
    expect(system.programMemory.address()).toBe(0);
    [...pipeline];
    expect(system.programMemory.address()).toBe(3);
});

Deno.test("Insufficient program memory causes generation to fail", () => {
    const system = systemUnderTest();
    const pipeline = testPipeline(
        system, {"label": "", "code": [1, 2, 3, 4, 1, 2]}
    );
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0x00));
    const preFailureAddress = system.programMemory.address();
    const result = pipeline.next().value!;
    expect(result.failed()).toBeTruthy();
    const failures = [...result.failures()];
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("programMemory_outOfRange");
    // Code is still generated
    expect(result.code).toEqual([[1, 2], [3, 4], [1, 2]]);
    // But the address doesn't advance
    expect(system.programMemory.address()).toBe(preFailureAddress);
});

Deno.test("Advancing beyond the end of program memory causes failure", () => {
    const code = [1, 2, 3, 4, 5, 6];
    const expected = [[1, 2], [3, 4], [5, 6]];
    const system = systemUnderTest();
    const pipeline = testPipeline(
        system,
        {"label": "", "code": code},
        {"label": "", "code": code}
    );
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0x06));

    const okSoFar = pipeline.next().value!;
    expect(okSoFar.failed()).toBeFalsy();
    expect(okSoFar.failures.length).toBe(0);
    expect(okSoFar.code).toEqual(expected);
    const preFailureAddress = system.programMemory.address();

    const outOfMemory = pipeline.next().value!;
    expect(outOfMemory.failed()).toBeTruthy();
    const failures = [...outOfMemory.failures()];
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("programMemory_outOfRange");
    // Code is still generated
    expect(outOfMemory.code).toEqual(expected);
    // But the address doesn't advance
    expect(system.programMemory.address()).toBe(preFailureAddress);
});
