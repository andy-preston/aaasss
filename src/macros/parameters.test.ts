import { assertEquals } from "assert/equals";
import { assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { testEnvironment, testLine } from "./testing.ts";

Deno.test("The macro directive name must be a string", () => {
    const environment = testEnvironment();
    const result = environment.jsExpression("macro(47);");
    assertFailureWithExtra(result, "type_string", "47");
});

Deno.test("The macro doesn't have to have parameters", () => {
    const environment = testEnvironment();
    const result = environment.jsExpression('macro("without");');
    assertSuccess(result, undefined);
});

Deno.test("The macro can have parameters", () => {
    const environment = testEnvironment();
    assertSuccess(
        environment.jsExpression('macro("withParams", ["a", "b"]);'),
        undefined
    );
    environment.macros.lines(testLine("", "TST", ["a", "b"])).toArray();
    assertSuccess(
        environment.jsExpression("end();"),
        undefined
    );
    environment.macros.lines(testLine("", "", [])).toArray();

    assertSuccess(
        environment.jsExpression('withParams("1", "2");'),
        undefined
    );
    const lines = environment.macros.lines(
        testLine("", "", [])
    ).toArray();
    assertEquals(lines[1]!.symbolicOperands, ["1", "2"]);
});

Deno.test("The parameters in a definition must be strings", () => {
    const environment = testEnvironment();
    const result = environment.jsExpression(
        'macro("with", ["a", 2, "b", 3]);'
    );
    assertFailureWithExtra(
        result, "type_strings", "1: number, 3: number"
    );
});

Deno.test("On calling a macro, the parameters must be strings or numbers", () => {
    const environment = testEnvironment();

    environment.jsExpression(
        'macro("testMacro", ["a", "b"]);'
    );
    environment.macros.lines(
        testLine("", "TST", ["a", "b"])
    ).toArray();
    environment.jsExpression("end();");
    environment.macros.lines(testLine("", "", [])).toArray();

    const result = environment.jsExpression(
        'testMacro(true, "a", 2, {"c": "c"});'
    );
    assertFailureWithExtra(result, "type_macroParams", "0: boolean, 3: object");
});
