import { assertSuccess, assertFailure, assertFailureWithExtra } from "../failure/testing.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("Returns Failure when no device is selected", () => {
    const system = systemUnderTest();
    const name = system.deviceProperties.public.value("deviceName");
    assertFailure(name, "device_notSelected");
    const reducedCore = system.deviceProperties.public.hasReducedCore();
    assertFailure(reducedCore, "device_notSelected");
    const unsupported = system.deviceProperties.public.isUnsupported("MUL");
    assertFailure(unsupported, "mnemonic_supportedUnknown");
});

Deno.test("Returns default boolean properties once a device name is selected", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    const name = system.deviceProperties.public.value("deviceName");
    assertSuccess(name, "imaginaryDevice");
    const reducedCore = system.deviceProperties.public.hasReducedCore();
    assertSuccess(reducedCore, false);
    const unsupported = system.deviceProperties.public.isUnsupported("MUL");
    assertSuccess(unsupported, false);
});

Deno.test("Returns device properties once device type is selected", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    const name = system.deviceProperties.public.value("deviceName");
    assertSuccess(name, "imaginaryDevice");
    system.deviceProperties.reducedCore(true);
    const reducedCore = system.deviceProperties.public.hasReducedCore();
    assertSuccess(reducedCore, true);
    system.deviceProperties.unsupportedInstructions(["multiply"]);
    const unsupported = system.deviceProperties.public.isUnsupported("MUL");
    assertFailure(unsupported, "mnemonic_notSupported");
});

Deno.test("After loading the device, it returns property values", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    system.deviceProperties.property("PORTD", "3F");
    const result = system.deviceProperties.public.value("PORTD");
    assertSuccess(result, "3F");
});

Deno.test("Property values are, commonly, hex values", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    system.deviceProperties.property("PORTD", "3F");
    const result = system.deviceProperties.public.numericValue("PORTD");
    assertSuccess(result, 0x3f);
});

Deno.test("... in upper case", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    system.deviceProperties.property("PORTD", "3f");
    const result = system.deviceProperties.public.numericValue("PORTD");
    assertFailureWithExtra(result, "device_internalFormat", [
        "imaginaryDevice", "PORTD", "3f"
    ]);
});

Deno.test("Non-hex values can't be converted to numbers", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    const result = system.deviceProperties.public.numericValue("deviceName");
    assertFailureWithExtra(result, "device_internalFormat", [
        "imaginaryDevice", "deviceName", "imaginaryDevice"
    ]);
});

Deno.test("Fails if, after loading device, required symbol is still not found", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    const result = system.deviceProperties.public.value("nonExistant");
    assertFailureWithExtra(result, "symbol_notFound", [
        "imaginaryDevice", "nonExistant"
    ]);
});
