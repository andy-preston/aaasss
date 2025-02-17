import { assertSuccess, assertFailure } from "../failure/testing.ts";
import { testEnvironment } from "./testing.ts";

// See also: ./src/state/program-memory.test.ts

Deno.test("Returns Failure when no device is selected", () => {
    const environment = testEnvironment();
    const name = environment.deviceProperties.public.value("deviceName");
    assertFailure(name, "device_notSelected");
    const reducedCore = environment.deviceProperties.public.hasReducedCore();
    assertFailure(reducedCore, "device_notSelected");
    const unsupported = environment.deviceProperties.public.isUnsupported("MUL");
    assertFailure(unsupported, "mnemonic_supportedUnknown");
});

Deno.test("Returns default Answer(s) once a device name is selected", () => {
    const environment = testEnvironment();
    environment.deviceProperties.property("deviceName", "test");
    const name = environment.deviceProperties.public.value("deviceName");
    assertSuccess(name, "test");
    const reducedCore = environment.deviceProperties.public.hasReducedCore();
    assertSuccess(reducedCore, false);
    const unsupported = environment.deviceProperties.public.isUnsupported("MUL");
    assertSuccess(unsupported, false);
});

Deno.test("Returns device properties once device type is selected", () => {
    const environment = testEnvironment();
    environment.deviceProperties.property("deviceName", "test");
    const name = environment.deviceProperties.public.value("deviceName");
    assertSuccess(name, "test");
    environment.deviceProperties.reducedCore(true);
    const reducedCore = environment.deviceProperties.public.hasReducedCore();
    assertSuccess(reducedCore, true);
    environment.deviceProperties.unsupportedInstructions(["multiply"]);
    const unsupported = environment.deviceProperties.public.isUnsupported("MUL");
    assertFailure(unsupported, "mnemonic_notSupported");
});
