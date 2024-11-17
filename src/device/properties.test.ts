import { assert, assertEquals, assertFalse } from "assert";
import type { Box, Failure } from "../value-or-failure.ts";
import { deviceProperties } from "./properties.ts";
import { anEmptyContext } from "../testing.ts";

Deno.test("Returns Failure when no device is selected", () => {
    const properties = deviceProperties(anEmptyContext());

    const name = properties.public.name();
    assertEquals(name.which, "failure");
    assertEquals((name as Failure).kind, "device.notSelected");

    const reducedCore = properties.public.hasReducedCore();
    assertEquals(reducedCore.which, "failure");
    assertEquals((reducedCore as Failure).kind, "device.notSelected");

    const unsupported = properties.public.isUnsupported("MUL");
    assertEquals(unsupported.length, 2);
    assertEquals(unsupported[0]!.kind, "device.notSelected");
    assertEquals(unsupported[1]!.kind, "mnemonic.supportedUnknown");
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
    assertEquals(unsupported.length, 0);
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
    assertEquals(unsupported.length, 1);
    assertEquals(unsupported[0]!.kind, "mnemonic.notSupported");
});
