import { assertFailureWithError, assertSuccess } from "../../failure/testing.ts";
import { anEmptyContext } from "../context.ts";
import { operands } from "./operands.ts";

const testEnvironment = () => {
    const context = anEmptyContext();
    return {
        "context": context,
        "operand": operands(context)
    };
};

Deno.test("An expression yields a value", () => {
    const environment = testEnvironment();
    assertSuccess(environment.operand("20 / 2"), 10);
});

Deno.test("An property yields a value", () => {
    const environment = testEnvironment();
    environment.context.property("R7", 7);
    assertSuccess(environment.operand("R7"), 7);
});

Deno.test("An uninitialised property yields a failure", () => {
    const environment = testEnvironment();
    assertFailureWithError(
        environment.operand("notDefined"),
        "js_error",
        ReferenceError,
        "notDefined is not defined"
    );
});
