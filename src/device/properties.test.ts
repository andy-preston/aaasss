import { assertSuccess, assertFailure } from "../failure/testing.ts";
import { testEnvironment } from "./testing.ts";

// See also: ./src/state/program-memory.test.ts

Deno.test("Returns Failure when no device is selected", () => {
    const environment = testEnvironment();
    const name = environment.properties.name();
    assertFailure(name, "device_notSelected");
    const reducedCore = environment.properties.hasReducedCore();
    assertFailure(reducedCore, "device_notSelected");
    const unsupported = environment.properties.isUnsupported("MUL");
    assertFailure(unsupported, "mnemonic_supportedUnknown");
});

Deno.test("Returns default Answer(s) once a device name is selected", () => {
    const environment = testEnvironment();
    environment.device.setName("testName");
    const name = environment.properties.name();
    assertSuccess(name, "testName");
    const reducedCore = environment.properties.hasReducedCore();
    assertSuccess(reducedCore, false);
    const unsupported = environment.properties.isUnsupported("MUL");
    assertSuccess(unsupported, false);
});

Deno.test("Returns selected Answer(s) once 'rules' are selected", () => {
    const environment = testEnvironment();
    environment.device.setName("testName");
    const name = environment.properties.name();
    assertSuccess(name, "testName");
    environment.device.reducedCore(true);
    const reducedCore = environment.properties.hasReducedCore();
    assertSuccess(reducedCore, true);
    environment.device.unsupportedInstructions(["multiply"]);
    const unsupported = environment.properties.isUnsupported("MUL");
    assertFailure(unsupported, "mnemonic_notSupported");
});
