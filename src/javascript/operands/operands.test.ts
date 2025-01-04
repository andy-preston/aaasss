import { assert, assertEquals } from "assert";
import { assertFailureWithError } from "../../failure/testing.ts";
import { lineWithProcessedMacro } from "../../macro/line-types.ts";
import { SymbolicOperands } from "../../operands/data-types.ts";
import { lineWithAddress } from "../../program-memory/line-types.ts";
import { lineWithRawSource } from "../../source-code/line-types.ts";
import { lineWithTokens } from "../../tokens/line-types.ts";
import { anEmptyContext } from "../context.ts";
import { lineWithRenderedJavascript } from "../embedded/line-types.ts";
import { operandsFromContext } from "./from-context.ts";

const testEnvironment = () => {
    const context = anEmptyContext();
    return {
        "context": context,
        "operand": operandsFromContext(context)
    };
};

const testLine = (symbolic: SymbolicOperands) => {
    const withSource = lineWithRawSource("", 0, false, "");
    const withJavascript = lineWithRenderedJavascript(withSource, "");
    const withTokens = lineWithTokens(withJavascript, "", "", symbolic)
    const withMacro = lineWithProcessedMacro(withTokens, "");
    return lineWithAddress(withMacro, 0);
}

Deno.test("An expression yields a value", () => {
    const environment = testEnvironment();
    const result = environment.operand(testLine(["20 / 2"]));
    assertEquals(result.numericOperands[0], 10);
});

Deno.test("A property yields a value", () => {
    const environment = testEnvironment();
    environment.context.property("R7", 7);
    const result = environment.operand(testLine(["R7"]));
    assertEquals(result.numericOperands[0], 7);
});

Deno.test("An index offset operand returns special values not related to the context", () => {
    const environment = testEnvironment();
    const yResult = environment.operand(testLine(["Y+"]));
    assertEquals(yResult.numericOperands[0], 1);
    const zResult = environment.operand(testLine(["Z+"]));
    assertEquals(zResult.numericOperands[0], 0);
});

Deno.test("An uninitialised property yields a failure", () => {
    const environment = testEnvironment();
    const result = environment.operand(testLine(["notDefined"]));
    assert(result.failed());
    result.failures().forEach((failure, index) => {
        assertEquals(index, 0);
        assertFailureWithError(
            failure,
            "js_error",
            ReferenceError,
            "notDefined is not defined"
        );
    });
});
