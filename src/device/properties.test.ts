import { assertEquals } from "assert";
import type { ClueFailure, Failure, OldFailure } from "../failure/bags.ts";
import { assertFailureWithExtra } from "../failure/testing.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("Device name fails when no device is selected", () => {
    const system = systemUnderTest();

    const result = system.deviceProperties.public.value("deviceName");
    assertEquals(result.type, "failures");
    const failures = result.it as Array<Failure>;
    assertEquals(failures.length, 2);
    assertEquals(failures[0]!.kind, "device_notSelected");
    assertEquals(failures[1]!.kind, "symbol_notFound");
    assertEquals((failures[1] as OldFailure).extra, [undefined, "deviceName"]);
});

Deno.test("reducedCore fails when no device is selected", () => {
    const system = systemUnderTest();

    const result = system.deviceProperties.public.hasReducedCore();
    assertEquals(result.type, "failures");
    const failures = result.it as Array<Failure>;
    assertEquals(failures.length, 1);
    assertEquals(failures[0]!.kind, "device_notSelected");
});

Deno.test("Unsupported instructions fails when no device is selected", () => {
    const system = systemUnderTest();

    const result = system.deviceProperties.public.isUnsupported("MUL");
    assertEquals(result.type, "failures");
    const failures = result.it as Array<Failure>;
    assertEquals(failures.length, 2);
    assertEquals(failures[0]!.kind, "device_notSelected");
    assertEquals(failures[1]!.kind, "mnemonic_supportedUnknown");
});

Deno.test("Returns device name once a device name is selected", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");

    const result = system.deviceProperties.public.value("deviceName");
    assertEquals(result.type, "string");
    assertEquals(result.it, "imaginaryDevice");
});

Deno.test("Returns default reducedCore flag once a device name is selected", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");

    const result = system.deviceProperties.public.hasReducedCore();
    assertEquals(result.type, "boolean");
    assertEquals(result.it, false);
});

Deno.test("Returns default unsupported instruction flags once a device name is selected", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");

    const result = system.deviceProperties.public.isUnsupported("MUL");
    assertEquals(result.type, "boolean");
    assertEquals(result.it, false);
});

Deno.test("Returns reduced core flag once device type is selected", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    system.deviceProperties.reducedCore(true);

    const result = system.deviceProperties.public.hasReducedCore();
    assertEquals(result.type, "boolean");
    assertEquals(result.it, true);
});

Deno.test("Returns mnemonic support once device type is selected", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    system.deviceProperties.unsupportedInstructions(["multiply"]);

    const result = system.deviceProperties.public.isUnsupported("MUL");
    assertEquals(result.type, "failures");
    const failures = result.it as Array<Failure>;
    assertEquals(failures.length, 1);
    assertEquals(failures[0]!.kind, "mnemonic_notSupported");
    assertEquals((failures[0] as ClueFailure).clue, "MUL");
});

Deno.test("After loading the device, it returns property values", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    system.deviceProperties.property("PORTD", "3F");

    const result = system.deviceProperties.public.value("PORTD");
    assertEquals(result.type, "string");
    assertEquals(result.it, "3F");
});

Deno.test("Property values are, commonly, hex values", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    system.deviceProperties.property("PORTD", "3F");

    const result = system.deviceProperties.public.numericValue("PORTD");
    assertEquals(result.type, "number");
    assertEquals(result.it, 0x3f);
});

Deno.test("... in upper case", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    system.deviceProperties.property("PORTD", "3f");

    const result = system.deviceProperties.public.numericValue("PORTD");
    assertEquals(result.type, "failures");
    assertFailureWithExtra(
        result.it as Array<Failure>, "device_internalFormat", [
            "imaginaryDevice", "PORTD", "3f"
        ]
    );
});

Deno.test("Non-hex values can't be converted to numbers", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");

    const result = system.deviceProperties.public.numericValue("deviceName");
    assertEquals(result.type, "failures");
    assertFailureWithExtra(
        result.it as Array<Failure>, "device_internalFormat", [
            "imaginaryDevice", "deviceName", "imaginaryDevice"
        ]
    );
});

Deno.test("Fails if, after loading device, required symbol is still not found", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");

    const result = system.deviceProperties.public.value("nonExistant");
    assertEquals(result.type, "failures");
    assertFailureWithExtra(
        result.it as Array<Failure>, "symbol_notFound", [
            "imaginaryDevice", "nonExistant"
        ]
    );
});
