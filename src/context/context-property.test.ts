import { assertFalse, assertThrows } from "assert";
import { anEmptyContext, assertSuccess } from "../testing.ts";

Deno.test("Coupled properties can be an arrow function", () => {
    const context = anEmptyContext();

    const aFunction = () => 57;
    context.coupledProperty("testProperty", aFunction);

    assertSuccess(context.value("testProperty"), "57");
});

Deno.test("A property can be defined and accessed", () => {
    const context = anEmptyContext();
    context.property("plop", 57);
    assertSuccess(context.value("plop"), "57");
});

Deno.test("A property can't be redefined to a new value", () => {
    const context = anEmptyContext();
    context.property("plop", 57);
    assertFalse(context.validProperty("plop", 99));
});

Deno.test("... and if you try, it will throw (which is very bad)", () => {
    const context = anEmptyContext();
    context.property("plop", 57);
    assertThrows(
        () => { context.property("plop", 99); },
        TypeError,
        "Cannot redefine property: plop"
    );
});

Deno.test("... but it can be 'redefined' with the same value", () => {
    const context = anEmptyContext();
    context.property("plop", 57);
    assertSuccess(context.value("plop"), "57");
    context.property("plop", 57);
    assertSuccess(context.value("plop"), "57");
});
