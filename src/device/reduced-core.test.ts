import { expect } from "jsr:@std/expect";
import { stringBag } from "../assembler/bags.ts";
import type { Failure } from "../failure/bags.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("reducedCore fails when no device is selected", () => {
    const system = systemUnderTest();
    const result = system.instructionSet.hasReducedCore();
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("device_notSelected");
});

Deno.test("Returns default reducedCore flag once a device name is selected", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("imaginaryDevice"));
    const result = system.instructionSet.hasReducedCore();
    expect(result.type).toBe("boolean");
    expect(result.it).toBe(false);
});

Deno.test("Returns reduced core flag once device type is selected", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("imaginaryDevice"));
    system.instructionSet.reducedCore(true);
    const result = system.instructionSet.hasReducedCore();
    expect(result.type).toBe("boolean");
    expect(result.it).toBe(true);
});
