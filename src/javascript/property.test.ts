import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { anEmptyContext } from "./context.ts";

Deno.test("A symbol can be defined and accessed", () => {
    const context = anEmptyContext();
    assertSuccess(context.define("plop", 57), undefined);
    assertSuccess(context.value("plop"), "57");
});

Deno.test("A symbol can't be redefined to a new value", () => {
    const context = anEmptyContext();
    assertSuccess(context.define("plop", 57), undefined);
    assertFailure(context.define("plop", 75), "context_redefined");
});

Deno.test("... but it can be 'redefined' with the same value", () => {
    const context = anEmptyContext();
    assertSuccess(context.define("plop", 57), undefined);
    assertSuccess(context.value("plop"), "57");
    assertSuccess(context.define("plop", 57), undefined);
    assertSuccess(context.value("plop"), "57");
});
