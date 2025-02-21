import { assertSuccess, assertFailure, assertFailureWithExtra } from "../failure/testing.ts";
import { testEnvironment } from "./testing.ts";

Deno.test("Returns Failure when no device is selected", () => {
    const environment = testEnvironment();
    const name = environment.deviceProperties.public.value("deviceName");
    assertFailure(name, "device_notSelected");
    const reducedCore = environment.deviceProperties.public.hasReducedCore();
    assertFailure(reducedCore, "device_notSelected");
    const unsupported = environment.deviceProperties.public.isUnsupported("MUL");
    assertFailure(unsupported, "mnemonic_supportedUnknown");
});

Deno.test("Returns default boolean properties once a device name is selected", () => {
    const environment = testEnvironment();
    environment.deviceProperties.property("deviceName", "imaginaryDevice");
    const name = environment.deviceProperties.public.value("deviceName");
    assertSuccess(name, "imaginaryDevice");
    const reducedCore = environment.deviceProperties.public.hasReducedCore();
    assertSuccess(reducedCore, false);
    const unsupported = environment.deviceProperties.public.isUnsupported("MUL");
    assertSuccess(unsupported, false);
});

Deno.test("Returns device properties once device type is selected", () => {
    const environment = testEnvironment();
    environment.deviceProperties.property("deviceName", "imaginaryDevice");
    const name = environment.deviceProperties.public.value("deviceName");
    assertSuccess(name, "imaginaryDevice");
    environment.deviceProperties.reducedCore(true);
    const reducedCore = environment.deviceProperties.public.hasReducedCore();
    assertSuccess(reducedCore, true);
    environment.deviceProperties.unsupportedInstructions(["multiply"]);
    const unsupported = environment.deviceProperties.public.isUnsupported("MUL");
    assertFailure(unsupported, "mnemonic_notSupported");
});

Deno.test("After loading the device, it returns property values", () => {
    const environment = testEnvironment();
    environment.deviceProperties.property("deviceName", "imaginaryDevice");
    environment.deviceProperties.property("PORTD", "3F");
    const result = environment.deviceProperties.public.value("PORTD");
    assertSuccess(result, "3F");
});

Deno.test("Property values are, commonly, hex values", () => {
    const environment = testEnvironment();
    environment.deviceProperties.property("deviceName", "imaginaryDevice");
    environment.deviceProperties.property("PORTD", "3F");
    const result = environment.deviceProperties.public.numericValue("PORTD");
    assertSuccess(result, 0x3f);
});

Deno.test("... in upper case", () => {
    const environment = testEnvironment();
    environment.deviceProperties.property("deviceName", "imaginaryDevice");
    environment.deviceProperties.property("PORTD", "3f");
    const result = environment.deviceProperties.public.numericValue("PORTD");
    assertFailureWithExtra(result, "device_internalFormat", [
        "imaginaryDevice", "PORTD", "3f"
    ]);
});

Deno.test("Non-hex values can't be converted to numbers", () => {
    const environment = testEnvironment();
    environment.deviceProperties.property("deviceName", "imaginaryDevice");
    const result = environment.deviceProperties.public.numericValue("deviceName");
    assertFailureWithExtra(result, "device_internalFormat", [
        "imaginaryDevice", "deviceName", "imaginaryDevice"
    ]);
});

Deno.test("Fails if, after loading device, required symbol is still not found", () => {
    const environment = testEnvironment();
    environment.deviceProperties.property("deviceName", "imaginaryDevice");
    const result = environment.deviceProperties.public.value("nonExistant");
    assertFailureWithExtra(result, "symbol_notFound", [
        "imaginaryDevice", "nonExistant"
    ]);
});
