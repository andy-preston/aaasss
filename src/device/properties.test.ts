import { extractedFailures } from "../failure/bags.ts";
import { assertFailureKind, assertFailures, assertFailureWithExtra, assertSuccessWith } from "../failure/testing.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("Returns Failure when no device is selected", () => {
    const system = systemUnderTest();
    const name = system.deviceProperties.public.value("deviceName");
    assertFailures(name);
    assertFailureKind(extractedFailures(name), "device_notSelected");
    const reducedCore = system.deviceProperties.public.hasReducedCore();
    assertFailures(reducedCore);
    assertFailureKind(extractedFailures(reducedCore), "device_notSelected");
    const unsupported = system.deviceProperties.public.isUnsupported("MUL");
    assertFailures(unsupported);
    assertFailureKind(extractedFailures(unsupported), "mnemonic_supportedUnknown");
});

Deno.test("Returns default boolean properties once a device name is selected", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    const name = system.deviceProperties.public.value("deviceName");
    assertSuccessWith(name, "imaginaryDevice");
    const reducedCore = system.deviceProperties.public.hasReducedCore();
    assertSuccessWith(reducedCore, false);
    const unsupported = system.deviceProperties.public.isUnsupported("MUL");
    assertSuccessWith(unsupported, false);
});

Deno.test("Returns device properties once device type is selected", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    const name = system.deviceProperties.public.value("deviceName");
    assertSuccessWith(name, "imaginaryDevice");
    system.deviceProperties.reducedCore(true);
    const reducedCore = system.deviceProperties.public.hasReducedCore();
    assertSuccessWith(reducedCore, true);
    system.deviceProperties.unsupportedInstructions(["multiply"]);
    const unsupported = system.deviceProperties.public.isUnsupported("MUL");
    assertFailures(unsupported);
    assertFailureKind(extractedFailures(unsupported), "mnemonic_notSupported");
});

Deno.test("After loading the device, it returns property values", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    system.deviceProperties.property("PORTD", "3F");
    const result = system.deviceProperties.public.value("PORTD");
    assertSuccessWith(result, "3F");
});

Deno.test("Property values are, commonly, hex values", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    system.deviceProperties.property("PORTD", "3F");
    const result = system.deviceProperties.public.numericValue("PORTD");
    assertSuccessWith(result, 0x3f);
});

Deno.test("... in upper case", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    system.deviceProperties.property("PORTD", "3f");
    const result = system.deviceProperties.public.numericValue("PORTD");
    assertFailures(result);
    assertFailureWithExtra(
        extractedFailures(result), "device_internalFormat", [
            "imaginaryDevice", "PORTD", "3f"
        ]
    );
});

Deno.test("Non-hex values can't be converted to numbers", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    const result = system.deviceProperties.public.numericValue("deviceName");
    assertFailures(result);
    assertFailureWithExtra(
        extractedFailures(result), "device_internalFormat", [
            "imaginaryDevice", "deviceName", "imaginaryDevice"
        ]
    );
});

Deno.test("Fails if, after loading device, required symbol is still not found", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "imaginaryDevice");
    const result = system.deviceProperties.public.value("nonExistant");
    assertFailures(result);
    assertFailureWithExtra(
        extractedFailures(result), "symbol_notFound", [
            "imaginaryDevice", "nonExistant"
        ]
    );
});
