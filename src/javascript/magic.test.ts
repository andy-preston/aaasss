import { assertEquals } from "assert/equals";
import { returnIfExpression } from "./magic.ts";

Deno.test("A simple expression gains a `return`", () => {
    assertEquals(
        returnIfExpression("1 + 23"),
        "return 1 + 23"
    );
});

Deno.test("An expression that already has a `return` does not gain a second", () => {
    assertEquals(
        returnIfExpression("return 1 + 23"),
        "return 1 + 23"
    );
});

Deno.test("Statement/expression spanning lines is considered too complex to get one", () => {
    assertEquals(
        returnIfExpression("1 +\n23"),
        "1 +\n23"
    );
});

Deno.test("Statements containing semicolons are considered too complex", () => {
    assertEquals(
        returnIfExpression("testing(); testing()"),
        "testing(); testing()"
    );
});

Deno.test("Code containing assignments doesn't get a `return`", () => {
    assertEquals(
        returnIfExpression("a = 19"),
        "a = 19"
    );
});

Deno.test("Comparisons including an equals sign are not confused for assignments", () => {
    assertEquals(
        returnIfExpression("a == 1 || b >= 2 || c <= 3 || d != 4"),
        "return a == 1 || b >= 2 || c <= 3 || d != 4"
    );
});

Deno.test("Assignments with comparisons are still seen as assignments", () => {
    assertEquals(
        returnIfExpression("z = a == 1 || b >= 2 || c <= 3 || d != 4"),
        "z = a == 1 || b >= 2 || c <= 3 || d != 4"
    );
});
