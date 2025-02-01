import { assertFailureWithError, assertSuccess } from "../failure/testing.ts";
import { anEmptyContext } from "./context.ts";
import { jSExpression } from "./expression.ts";

const testEnvironment = () => {
    const context = anEmptyContext();
    return {
        "expression": jSExpression(context)
    };
};

Deno.test("Simple expressions do not require a `return`", () => {
    const environment = testEnvironment();
    assertSuccess(environment.expression("20 / 2"), "10");
});

Deno.test("...but you can include one if you want", () => {
    const environment = testEnvironment();
    assertSuccess(environment.expression("return 20 / 2"), "10");
});

Deno.test("If the result is undefined, `value` returns empty string", () => {
    const environment = testEnvironment();
    assertSuccess(environment.expression("undefined;"), "");
});

Deno.test("A plain assignment will not return a value", () => {
    const environment = testEnvironment();
    assertSuccess(environment.expression("this.test = 4;"), "");
});

Deno.test("Javascript can contain newlines", () => {
    const environment = testEnvironment();
    const js = "this.test1 = 4;\nthis.test2 = 6;\n return test1 + test2;";
    assertSuccess(environment.expression(js), "10");
});

Deno.test("An unknown variable gives a reference error", () => {
    const environment = testEnvironment();
    assertFailureWithError(
        environment.expression("this.test = plop * 10;"),
        "js_error",
        ReferenceError,
        "plop is not defined"
    );
});

Deno.test("Syntax errors are returned as errors too", () => {
    const environment = testEnvironment();
    assertFailureWithError(
        environment.expression("this is just nonsense"),
        "js_error",
        SyntaxError,
        "Unexpected identifier 'is'"
    );
});
