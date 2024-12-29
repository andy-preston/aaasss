import {
    assertFailure, assertSuccess
} from "../coupling/value-failure-testing.ts";
import { anEmptyContext } from "./context.ts";

Deno.test("Coupled properties can be an arrow function", () => {
    const context = anEmptyContext();
    const aFunction = () => 57;
    context.coupledProperty("testProperty", aFunction);
    assertSuccess(context.value("testProperty"), "57");
});

Deno.test("A property can be defined and accessed", () => {
    const context = anEmptyContext();
    const result = context.property("plop", 57);
    assertSuccess(result, 57);
    assertSuccess(context.value("plop"), "57");
});

Deno.test("A property can't be redefined to a new value", () => {
    const context = anEmptyContext();
    const firstResult = context.property("plop", 57);
    assertSuccess(firstResult, 57);
    const secondResult = context.property("plop", 75);
    assertFailure(secondResult, "context_redefined");
});

Deno.test("... but it can be 'redefined' with the same value", () => {
    const context = anEmptyContext();
    context.property("plop", 57);
    assertSuccess(context.value("plop"), "57");
    context.property("plop", 57);
    assertSuccess(context.value("plop"), "57");
});
