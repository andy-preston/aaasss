import {
    anEmptyContext, assertFailureWithError, assertSuccess
} from "../testing.ts";

Deno.test("An expression yields a value", () => {
    const context = anEmptyContext();
    assertSuccess(context.operand("20 / 2"), 10);
});

Deno.test("An property yields a value", () => {
    const context = anEmptyContext();
    context.property("R7", 7);
    assertSuccess(context.operand("R7"), 7);
});

Deno.test("An uninitialised property yields and error", () => {
    const context = anEmptyContext();
    assertFailureWithError(
        context.operand("notDefined"),
        "js.error",
        ReferenceError,
        "notDefined is not defined"
    );
});
