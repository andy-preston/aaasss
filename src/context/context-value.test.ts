import {
    anEmptyContext, assertFailureWithError, assertSuccess
} from "../testing.ts";

Deno.test("Simple expressions do not require a `return`", () => {
    const context = anEmptyContext();
    assertSuccess(context.value("20 / 2"), "10");
});

Deno.test("...but you can include one if you want", () => {
    const context = anEmptyContext();
    assertSuccess(context.value("return 20 / 2"), "10");
});

Deno.test("If the result is undefined, `value` returns empty string", () => {
    const context = anEmptyContext();
    assertSuccess(context.value("undefined;"), "");
});

Deno.test("A plain assignment will not return a value", () => {
    const context = anEmptyContext();
    assertSuccess(context.value("this.test = 4;"), "");
});

Deno.test("Javascript can contain newlines", () => {
    const context = anEmptyContext();
    const js = "this.test1 = 4;\nthis.test2 = 6;\n return test1 + test2;";
    assertSuccess(context.value(js), "10");
});

Deno.test("An unknown variable gives a reference error", () => {
    const context = anEmptyContext();
    assertFailureWithError(
        context.value("this.test = plop * 10;"),
        "jsError",
        ReferenceError,
        "plop is not defined"
    );
});

Deno.test("Syntax errors are returned as errors too", () => {
    const context = anEmptyContext();
    assertFailureWithError(
        context.value("this is just nonsense"),
        "jsError",
        SyntaxError,
        "Unexpected identifier 'is'"
    );
});
