import { assertEquals } from "assert";
import { anEmptyContext } from "../testing.ts";
import { deviceChooser } from "./chooser.ts";
import { deviceProperties } from "./properties.ts";
import type { Box, Failure } from "../value-or-failure.ts";

Deno.test("You can choose any device that has a definition file", () => {
    for (const deviceName of ["AT-Tiny 84", "AT_Tiny 24", "AT.Tiny 44"]) {
        const context = anEmptyContext();
        const chooser = deviceChooser(deviceProperties(context), context);
        const result = chooser.directive(deviceName);
        assertEquals(result.which, "box");
        assertEquals((result as Box).value, "");
    }
});

Deno.test("Choosing an non-existant device returns a Failure", () => {
    const context = anEmptyContext();
    const chooser = deviceChooser(deviceProperties(context), context);
    const result = chooser.directive("notARealDevice");
    assertEquals(result.which, "failure");
    assertEquals((result as Failure).kind, "deviceNotFound");
});
