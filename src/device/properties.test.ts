import { assert, assertEquals, assertFalse } from "assert";
import type { Answer, Box, Failure } from "../value-or-failure.ts";
import { deviceProperties } from "./properties.ts";
import { anEmptyContext } from "../testing.ts";

Deno.test("Returns Failure when no device is selected", () => {
    const properties = deviceProperties(anEmptyContext());

    const name = properties.public.name();
    assertEquals(name.which, "failure");
    assertEquals((name as Failure).kind, "noDeviceSelected");

    const reducedCore = properties.public.hasReducedCore();
    assertEquals(reducedCore.which, "failure");
    assertEquals((reducedCore as Failure).kind, "noDeviceSelected");

    const unsupported = properties.public.isUnsupported("MUL");
    assertEquals(unsupported.which, "failure");
    assertEquals((unsupported as Failure).kind, "noDeviceSelected");
});

Deno.test("Returns default Answer(s) once a device name is selected", () => {
    const properties = deviceProperties(anEmptyContext());

    properties.setName("testName");
    const name = properties.public.name();
    assertEquals(name.which, "box");
    assertEquals((name as Box).value, "testName");

    const reducedCore = properties.public.hasReducedCore();
    assertEquals(reducedCore.which, "answer");
    assertFalse((reducedCore as Answer).answer);

    const unsupported = properties.public.isUnsupported("MUL");
    assertEquals(unsupported.which, "answer");
    assertFalse((unsupported as Answer).answer);
});

Deno.test("Returns selected Answer(s) once 'rules' are selected", () => {
    const properties = deviceProperties(anEmptyContext());

    properties.setName("testName");
    const name = properties.public.name();
    assertEquals(name.which, "box");
    assertEquals((name as Box).value, "testName");

    properties.reducedCore(true);
    const reducedCore = properties.public.hasReducedCore();
    assertEquals(reducedCore.which, "answer");
    assert((reducedCore as Answer).answer);

    properties.unsupportedInstructions(["multiply"]);
    const unsupported = properties.public.isUnsupported("MUL");
    assertEquals(unsupported.which, "answer");
    assert((unsupported as Answer).answer);
});
