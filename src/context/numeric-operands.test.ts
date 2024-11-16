import { assert, assertEquals, assertFalse } from "assert";
import {
    assemblyLine, rawLine, SymbolicOperands, tokenisedLine
} from "../pipeline/line.ts";
import { anEmptyContext, assertFailureWithError } from "../testing.ts";
import { numericOperands  } from "./numeric-operands.ts";

const testLine = (symbolicOperands: SymbolicOperands) => tokenisedLine(
    assemblyLine(rawLine("", 0, ""), ""),
    "", "", symbolicOperands
);

Deno.test("An expression yields a value", () => {
    const line = numericOperands(anEmptyContext())(testLine(["5 * 9"]));
    assertFalse(line.failed());
    assertEquals(line.numericOperands.length, 1);
    assertEquals(line.numericOperands[0], 45);
});

Deno.test("An defined property yields it's value", () => {
    const context = anEmptyContext();
    context.property("R5", 5);
    const line = numericOperands(context)(testLine(["R5"]));
    assertFalse(line.failed());
    assertEquals(line.numericOperands.length, 1);
    assertEquals(line.numericOperands[0], 5);
});

Deno.test("Multiple operands will be calculated", () => {
    const context = anEmptyContext();
    context.property("R5", 5);
    const line = numericOperands(context)(testLine(["R5", "23 * 7"]));
    assertFalse(line.failed());
    assertEquals(line.numericOperands.length, 2);
    assertEquals(line.numericOperands[0], 5);
    assertEquals(line.numericOperands[1], 161);
});

Deno.test("An undefined property yields a failure and an undefined property", () => {
    const line = numericOperands(anEmptyContext())(testLine(["notDefined"]));
    assert(line.failed());
    assertEquals(line.failures.length, 1);
    assertFailureWithError(
        line.failures[0]!,
        "js.error",
        ReferenceError,
        "notDefined is not defined"
    );
    assertEquals(line.numericOperands.length, 1);
    assertEquals(line.numericOperands[0], undefined);
});
