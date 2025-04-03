import { expect } from "jsr:@std/expect";
import type { ClueFailure, Failure } from "../failure/bags.ts";
import { systemUnderTest } from "./testing.ts";
import { numberBag, stringBag } from "../assembler/bags.ts";

Deno.test("Getting a device property when no deviceName is present fails", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("something", numberBag(23));
    const result = system.symbolTable.deviceSymbolValue("something", "number");
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("device_notSelected");
});

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

Deno.test("After loading the device, it returns property values", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("imaginaryDevice"));
    system.symbolTable.deviceSymbol("PORTD", numberBag(0x3f));
    const result = system.symbolTable.deviceSymbolValue("PORTD", "number");
    expect(result.type).toBe("number");
    expect(result.it).toBe(0x3f);
});

Deno.test("Device dependent property values are type checked", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("imaginaryDevice"));
    system.symbolTable.deviceSymbol("PORTD", stringBag("nonsense"));
    expect(
        () => { system.symbolTable.deviceSymbolValue("PORTD", "number"); }
    ).toThrow<Error>(
        "Device configuration error imaginaryDevice - PORTD - number - string"
    );
});
