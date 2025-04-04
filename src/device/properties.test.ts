import { expect } from "jsr:@std/expect";
import { stringBag } from "../assembler/bags.ts";
import type { ClueFailure, Failure } from "../failure/bags.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("reducedCore fails when no device is selected", () => {
    const system = systemUnderTest();
    const result = system.deviceProperties.public.hasReducedCore();
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("device_notSelected");
});

Deno.test("Unsupported instructions fails when no device is selected", () => {
    const system = systemUnderTest();
    const result = system.deviceProperties.public.isUnsupported("MUL");
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(2);
    expect(failures[0]!.kind).toBe("device_notSelected");
    expect(failures[1]!.kind).toBe("mnemonic_supportedUnknown");
});

Deno.test("Returns default reducedCore flag once a device name is selected", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("imaginaryDevice"));
    const result = system.deviceProperties.public.hasReducedCore();
    expect(result.type).toBe("boolean");
    expect(result.it).toBe(false);
});

Deno.test("Returns default unsupported instruction flags once a device name is selected", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("imaginaryDevice"));
    const result = system.deviceProperties.public.isUnsupported("MUL");
    expect(result.type).toBe("boolean");
    expect(result.it).toBe(false);
});

Deno.test("Returns reduced core flag once device type is selected", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("imaginaryDevice"));
    system.deviceProperties.reducedCore(true);
    const result = system.deviceProperties.public.hasReducedCore();
    expect(result.type).toBe("boolean");
    expect(result.it).toBe(true);
});

Deno.test("Returns mnemonic support once device type is selected", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("imaginaryDevice"));
    system.deviceProperties.unsupportedInstructions(["multiply"]);
    const result = system.deviceProperties.public.isUnsupported("MUL");
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("mnemonic_notSupported");
    expect((failures[0] as ClueFailure).clue).toBe("MUL");
});
