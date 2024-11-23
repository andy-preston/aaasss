import { assert, assertEquals, assertFalse } from "assert";
import type { Box, Failure } from "../value-or-failure.ts";
import { deviceProperties } from "./properties.ts";
import { anEmptyContext } from "../testing.ts";

// See also: ./src/state/program-memory.test.ts

Deno.test("Returns Failure when no device is selected", () => {
    const properties = deviceProperties(anEmptyContext());

    const name = properties.public.name();
    assertEquals(name.which, "failure");
    assertEquals((name as Failure).kind, "device.notSelected");

    const reducedCore = properties.public.hasReducedCore();
    assertEquals(reducedCore.which, "failure");
    assertEquals((reducedCore as Failure).kind, "device.notSelected");

    const unsupported = properties.public.isUnsupported("MUL");

    assertEquals(unsupported.which, "failure");
    assertEquals((unsupported as Failure).kind, "mnemonic.supportedUnknown");
});

Deno.test("Returns default Answer(s) once a device name is selected", () => {
    const properties = deviceProperties(anEmptyContext());

    properties.setName("testName");
    const name = properties.public.name();
    assertEquals(name.which, "box");
    assertEquals((name as Box<string>).value, "testName");

    const reducedCore = properties.public.hasReducedCore();
    assertEquals(reducedCore.which, "box");
    assertFalse((reducedCore as Box<boolean>).value);

    const unsupported = properties.public.isUnsupported("MUL");
    assertEquals(unsupported.which, "box");
    assertFalse((unsupported as Box<boolean>).value);
});

Deno.test("Returns selected Answer(s) once 'rules' are selected", () => {
    const properties = deviceProperties(anEmptyContext());

    properties.setName("testName");
    const name = properties.public.name();
    assertEquals(name.which, "box");
    assertEquals((name as Box<string>).value, "testName");

    properties.reducedCore(true);
    const reducedCore = properties.public.hasReducedCore();
    assertEquals(reducedCore.which, "box");
    assert((reducedCore as Box<boolean>).value);

    properties.unsupportedInstructions(["multiply"]);
    const unsupported = properties.public.isUnsupported("MUL");
    assertEquals(unsupported.which, "failure");
    assertEquals((unsupported as Failure).kind, "mnemonic.notSupported");
});
