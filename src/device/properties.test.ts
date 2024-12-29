import { assertSuccess, assertFailure } from "../failure/testing.ts";
import { anEmptyContext } from "../context/context.ts";
import { deviceProperties } from "./properties.ts";

// See also: ./src/state/program-memory.test.ts

Deno.test("Returns Failure when no device is selected", () => {
    const properties = deviceProperties(anEmptyContext());
    const name = properties.public.name();
    assertFailure(name, "device_notSelected");
    const reducedCore = properties.public.hasReducedCore();
    assertFailure(reducedCore, "device_notSelected");
    const unsupported = properties.public.isUnsupported("MUL");
    assertFailure(unsupported, "mnemonic_supportedUnknown");
});

Deno.test("Returns default Answer(s) once a device name is selected", () => {
    const properties = deviceProperties(anEmptyContext());
    properties.setName("testName");
    const name = properties.public.name();
    assertSuccess(name, "testName");
    const reducedCore = properties.public.hasReducedCore();
    assertSuccess(reducedCore, false);
    const unsupported = properties.public.isUnsupported("MUL");
    assertSuccess(unsupported, false);
});

Deno.test("Returns selected Answer(s) once 'rules' are selected", () => {
    const properties = deviceProperties(anEmptyContext());
    properties.setName("testName");
    const name = properties.public.name();
    assertSuccess(name, "testName");
    properties.reducedCore(true);
    const reducedCore = properties.public.hasReducedCore();
    assertSuccess(reducedCore, true);
    properties.unsupportedInstructions(["multiply"]);
    const unsupported = properties.public.isUnsupported("MUL");
    assertFailure(unsupported, "mnemonic_notSupported");
});
