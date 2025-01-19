import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { anEmptyContext } from "./context.ts";

Deno.test("A property can be defined and accessed", () => {
    const context = anEmptyContext();
    assertSuccess(context.property("plop", 57), 57);
    assertSuccess(context.value("plop"), "57");
});

Deno.test("A property can't be redefined to a new value", () => {
    const context = anEmptyContext();
    assertSuccess(context.property("plop", 57), 57);
    assertFailure(context.property("plop", 75), "context_redefined");
});

Deno.test("... but it can be 'redefined' with the same value", () => {
    const context = anEmptyContext();
    assertSuccess(context.property("plop", 57), 57);
    assertSuccess(context.value("plop"), "57");
    assertSuccess(context.property("plop", 57), 57);
    assertSuccess(context.value("plop"), "57");
});
