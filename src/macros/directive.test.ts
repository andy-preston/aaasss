import { assertEquals } from "assert/equals";
import { assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { jSExpression } from "../javascript/expression.ts";
import { anEmptyContext } from "../javascript/context.ts";
import { macros } from "./macros.ts";
import { testLine } from "./testing.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { pass } from "../assembler/pass.ts";

const testEnvironment = () => {
    const context = anEmptyContext();
    const symbols = symbolTable(context, pass());
    const macroProcessor = macros();
    symbols.directive("macro", macroProcessor.macro);
    symbols.directive("end", macroProcessor.end);
    symbols.directive("useMacro", macroProcessor.useMacro);
    return {
        "expression": jSExpression(context),
        "macroProcessor": macroProcessor
    };
};

Deno.test("The macro directive name must be a string", () => {
    const environment = testEnvironment();
    const result = environment.expression("macro(47);");
    assertFailureWithExtra(result, "type_string", "47");
});

Deno.test("The useMacro directive name must be a string", () => {
    const environment = testEnvironment();
    const result = environment.expression('useMacro(47);');
    assertFailureWithExtra(result, "type_string", "47");
});

Deno.test("The macro directive can be called without parameters", () => {
    const environment = testEnvironment();
    const result = environment.expression('macro("without");');
    assertSuccess(result, undefined);
});

Deno.test("The macro directive can be called with parameters", () => {
    const environment = testEnvironment();
    assertSuccess(
        environment.expression('macro("with", ["a", "b"]);'),
        undefined
    );
    environment.macroProcessor.lines(
        testLine("", "TST", ["a", "b"])
    ).toArray();

    assertSuccess(
        environment.expression("end();"),
        undefined
    );
    environment.macroProcessor.lines(testLine("", "", [])).toArray();

    assertSuccess(
        environment.expression('useMacro("with", ["1", "2"]);'),
        undefined
    );
    const lines = environment.macroProcessor.lines(
        testLine("", "", [])
    ).toArray();
    assertEquals(lines[1]!.symbolicOperands, ["1", "2"]);
});

Deno.test("If parameters are provided for macro they must be an array", () => {
    const environment = testEnvironment();
    const result = environment.expression(
        'macro("with", {"a": "a", "b": "b"});'
    );
    assertFailureWithExtra(result, "type_strings", "object");
});

Deno.test("... of strings", () => {
    const environment = testEnvironment();
    const result = environment.expression(
        'macro("with", ["a", 2, "b", 3]);'
    );
    assertFailureWithExtra(
        result, "type_strings", "1: number, 3: number"
    );
});

Deno.test("If macro parameters are provided for useMacro they must be an array", () => {
    const environment = testEnvironment();

    environment.expression(
        'macro("with", ["a", "b"]);'
    );
    environment.macroProcessor.lines(
        testLine("", "TST", ["a", "b"])
    ).toArray();
    environment.expression("end();");
    environment.macroProcessor.lines(testLine("", "", [])).toArray();

    const result = environment.expression(
        'useMacro("with", {"a": "a", "b": "b"});'
    );
    assertFailureWithExtra(result, "type_macroParams", "object");
});

Deno.test("... of strings or numbers", () => {
    const environment = testEnvironment();

    environment.expression(
        'macro("stringNumber", ["a", "b"]);'
    );
    environment.macroProcessor.lines(
        testLine("", "TST", ["a", "b"])
    ).toArray();
    environment.expression("end();");
    environment.macroProcessor.lines(testLine("", "", [])).toArray();

    const result = environment.expression(
        'useMacro("stringNumber", [true, "a", 2, {"c": "c"}]);'
    );
    assertFailureWithExtra(result, "type_macroParams", "0: boolean, 3: object");
});
