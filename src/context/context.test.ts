import { assertEquals, assertFalse, assertThrows } from "assert";
import { newContext } from "./context.ts";
import { newPass } from "../state/pass.ts";
import { assertFailureWithError, assertSuccess } from "./testing.ts";

Deno.test("Simple expressions do not require a `return`", () => {
    const context = newContext(newPass(() => {}));
    assertSuccess(context.value("20 / 2"), "10");
});

Deno.test("...but you can include one if you want", () => {
    const context = newContext(newPass(() => {}));
    assertSuccess(context.value("return 20 / 2"), "10");
});

Deno.test("If the result is undefined, inContext returns empty string", () => {
    const context = newContext(newPass(() => {}));
    assertSuccess(context.value("undefined;"), "");
});

Deno.test("A plain assignment will not return a value", () => {
    const context = newContext(newPass(() => {}));
    assertSuccess(context.value("this.test = 4;"), "");
});

Deno.test("Javascript can contain newlines", () => {
    const context = newContext(newPass(() => {}));
    assertSuccess(
        context.value(
            "this.test1 = 4;\nthis.test2 = 6;\n return test1 + test2;"
        ),
        "10"
    );
});

Deno.test("An unknown variable gives a reference error", () => {
    const context = newContext(newPass(() => {}));
    assertFailureWithError(
        context.value("this.test = plop * 10;"),
        "js",
        ReferenceError,
        "plop is not defined"
    );
});

Deno.test("Any directives that are added can be called as functions", () => {
    let directiveParameter = "";
    const testDirective = (parameter: string): void => {
        directiveParameter = parameter;
    };
    const context = newContext(newPass(() => {}));
    context.directive("testDirective", testDirective);
    context.value("testDirective('says hello')");
    assertEquals(directiveParameter, "says hello");
});

Deno.test("Syntax errors are returned as errors too", () => {
    const context = newContext(newPass(() => {}));
    assertFailureWithError(
        context.value("this is just nonsense"),
        "js",
        SyntaxError,
        "Unexpected identifier 'is'"
    );
});

Deno.test("Coupled properties can be an arrow function", () => {
    const aFunction = () => 57;
    const context = newContext(newPass(() => {}));
    context.coupledProperty("testProperty", aFunction);
    assertSuccess(context.value("testProperty"), "57");
});

Deno.test("A property can be defined and accessed", () => {
    const context = newContext(newPass(() => {}));
    context.property("plop", 57);
    assertSuccess(context.value("plop"), "57");
});

Deno.test("A property can't be redefined to a new value", () => {
    const context = newContext(newPass(() => {}));
    context.property("plop", 57);
    assertFalse(context.validProperty("plop", 99));
});

Deno.test("... and if you try, it will throw (which is very bad)", () => {
    const context = newContext(newPass(() => {}));
    context.property("plop", 57);
    assertThrows(
        () => { context.property("plop", 99); },
        TypeError,
        "Cannot redefine property: plop"
    );
});

Deno.test("... but it can be 'redefined' with the same value", () => {
    const context = newContext(newPass(() => {}));
    context.property("plop", 57);
    assertSuccess(context.value("plop"), "57");
    context.property("plop", 57);
    assertSuccess(context.value("plop"), "57");
});
