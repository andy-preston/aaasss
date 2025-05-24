import type { BoringFailure, Failure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { emptyBag, numberBag, stringBag } from "../assembler/bags.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("Origin directive is blocked by code in current line", () => {
    const system = systemUnderTest();
    system.line.code.push([0, 0]);
    const result = system.programMemory.origin(0);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]! as BoringFailure;
    expect(failure.kind).toBe("programMemory_cantOrg");
});

Deno.test("Origin directive is not blocked when there's no code in current line", () => {
    const system = systemUnderTest();
    const result = system.programMemory.origin(0);
    expect(result.type).not.toBe("failures");
});

Deno.test("Label directive enables labels to be set inside JS code", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));
    const origin = system.programMemory.origin(10);
    expect(origin).toEqual(emptyBag());
    const result = system.programMemory.label("aTest");
    expect(result).toEqual(emptyBag());
    expect(system.symbolTable.symbolValue("aTest")).toEqual(numberBag(10));
});
