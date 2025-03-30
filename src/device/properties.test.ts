import { expect } from "jsr:@std/expect";
import type { ClueFailure, DeviceFailure, Failure } from "../failure/bags.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("Device name fails when no device is selected", () => {
    const system = systemUnderTest();

    const result = system.deviceProperties.public.value("deviceName");
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(2);
    expect(failures[0]!.kind).toBe("device_notSelected");
    expect(failures[1]!.kind).toBe("symbol_notFound");
    const deviceFailure = failures[1] as DeviceFailure;
    expect(deviceFailure.device).toBe(undefined);
    expect(deviceFailure.clue).toBe("deviceName");
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

Deno.test("Returns device name once a device name is selected", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");

    const result = system.deviceProperties.public.value("deviceName");
    expect(result.type).toBe("string");
    expect(result.it).toBe("imaginaryDevice");
});

Deno.test("Returns default reducedCore flag once a device name is selected", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");

    const result = system.deviceProperties.public.hasReducedCore();
    expect(result.type).toBe("boolean");
    expect(result.it).toBe(false);
});

Deno.test("Returns default unsupported instruction flags once a device name is selected", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");

    const result = system.deviceProperties.public.isUnsupported("MUL");
    expect(result.type).toBe("boolean");
    expect(result.it).toBe(false);
});

Deno.test("Returns reduced core flag once device type is selected", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    system.deviceProperties.reducedCore(true);

    const result = system.deviceProperties.public.hasReducedCore();
    expect(result.type).toBe("boolean");
    expect(result.it).toBe(true);
});

Deno.test("Returns mnemonic support once device type is selected", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
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
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    system.deviceProperties.property("PORTD", "3F");

    const result = system.deviceProperties.public.value("PORTD");
    expect(result.type).toBe("string");
    expect(result.it).toBe("3F");
});

Deno.test("Property values are, commonly, hex values", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    system.deviceProperties.property("PORTD", "3F");

    const result = system.deviceProperties.public.numericValue("PORTD");
    expect(result.type).toBe("number");
    expect(result.it).toBe(0x3f);
});

Deno.test("... in upper case", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    system.deviceProperties.property("PORTD", "3f");

    const result = system.deviceProperties.public.numericValue("PORTD");
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as DeviceFailure;
    expect(failure.kind).toBe("device_internalFormat");
    expect(failure.device).toBe("imaginaryDevice");
    expect(failure.clue).toBe("PORTD: 3f");
});

Deno.test("Non-hex values can't be converted to numbers", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");

    const result = system.deviceProperties.public.numericValue("deviceName");
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as DeviceFailure;
    expect(failure.kind).toBe("device_internalFormat");
    expect(failure.device).toBe("imaginaryDevice");
    expect(failure.clue).toBe("deviceName: imaginaryDevice");
});

Deno.test("Fails if, after loading device, required symbol is still not found", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");

    const result = system.deviceProperties.public.value("nonExistant");
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as DeviceFailure;
    expect(failure.kind).toBe("symbol_notFound");
    expect(failure.device).toBe("imaginaryDevice");
    expect(failure.clue).toBe("nonExistant");
});
