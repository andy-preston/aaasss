import type { Code } from "../object-code/data-types.ts";

import { expect } from "jsr:@std/expect";
import { systemUnderTest } from "./testing.ts";
import { numberBag, stringBag } from "../assembler/bags.ts";

Deno.test("If a line has no code the address remains unchanged", () => {
    const system = systemUnderTest(
        {"label": "", "pokes": [], "code": []}
    );
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));

    expect(system.programMemory.address()).toBe(0);
    [...system.assemblyPipeline];
    expect(system.programMemory.address()).toBe(0);
});

Deno.test("The program counter advances by the number of words poked", () => {
    const system = systemUnderTest(
        {"label": "", "pokes": [[1, 2, 3, 4], [5, 6]], "code": []}
    );
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));
    expect(system.programMemory.address()).toBe(0);
    [...system.assemblyPipeline];
    expect(system.programMemory.address()).toBe(3);
});

Deno.test("... or by the number of words of code", () => {
    const system = systemUnderTest(
        {"label": "", "pokes": [], "code": [1, 2]}
    );
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));
    expect(system.programMemory.address()).toBe(0);
    [...system.assemblyPipeline];
    expect(system.programMemory.address()).toBe(1);
});

Deno.test("... or both", () => {
    const system = systemUnderTest(
        {"label": "", "pokes": [[1, 2, 3, 4], [5, 6]], "code": [1, 2]}
    );
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));
    expect(system.programMemory.address()).toBe(0);
    [...system.assemblyPipeline];
    expect(system.programMemory.address()).toBe(4);
});

Deno.test("Insufficient program memory causes generation to fail", () => {
    const system = systemUnderTest(
        {"label": "", "pokes": [[1, 2, 3, 4]], "code": [1, 2]}
    );
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0x00));
    const preFailureAddress = system.programMemory.address();
    const result = system.assemblyPipeline.next().value!;
    expect(result.failed()).toBeTruthy();
    const failures = [...result.failures()];
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("programMemory_outOfRange");
    // Code is still generated
    expect(result.code).toEqual([[1, 2, 3, 4], [1, 2]]);
    // But the address doesn't advance
    expect(system.programMemory.address()).toBe(preFailureAddress);
});

Deno.test("Advancing beyond the end of program memory causes failure", () => {
    const pokes = [[1, 2, 3, 4] as Code];
    const code = [5, 6] as Code;
    const expected = [pokes[0], code];
    const system = systemUnderTest(
        {"label": "", "pokes": pokes, "code": code},
        {"label": "", "pokes": pokes, "code": code}
    );
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0x06));

    const okSoFar = system.assemblyPipeline.next().value!;
    expect(okSoFar.failed()).toBeFalsy();
    expect(okSoFar.failures.length).toBe(0);
    expect(okSoFar.code).toEqual(expected);
    const preFailureAddress = system.programMemory.address();

    const outOfMemory = system.assemblyPipeline.next().value!;
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
