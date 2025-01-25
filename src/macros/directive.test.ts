import { assertEquals } from "assert/equals";
import { assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { anEmptyContext } from "../javascript/context.ts";
import { symbolTable } from "../listing/symbol-table.ts";
import { macros } from "./macros.ts";
import { testLine } from "./testing.ts";

const testEnvironment = () => {
    const context = anEmptyContext(symbolTable());
    const macroProcessor = macros();
    context.directive("macro", macroProcessor.macro);
    context.directive("end", macroProcessor.end);
    context.directive("useMacro", macroProcessor.useMacro);
    return {
        "context": context,
        "macroProcessor": macroProcessor
    };
};

Deno.test("The macro directive name must be a string", () => {
    const environment = testEnvironment();
    const result = environment.context.value("macro(47);");
    assertFailureWithExtra(result, "type_string", "47");
});

Deno.test("The useMacro directive name must be a string", () => {
    const environment = testEnvironment();
    const result = environment.context.value('useMacro(47);');
    assertFailureWithExtra(result, "type_string", "47");
});

Deno.test("The macro directive can be called without parameters", () => {
    const environment = testEnvironment();
    const result = environment.context.value('macro("without");');
    assertSuccess(result, undefined);
});

Deno.test("The macro directive can be called with parameters", () => {
    const environment = testEnvironment();
    assertSuccess(
        environment.context.value('macro("with", ["a", "b"]);'),
        undefined
    );
    environment.macroProcessor.lines(
        testLine("", "TST", ["a", "b"])
    ).toArray();

    assertSuccess(
        environment.context.value("end();"),
        undefined
    );
    assertSuccess(
        environment.context.value('useMacro("with", ["1", "2"]);'),
        undefined
    );
    const lines = environment.macroProcessor.lines(
        testLine("", "", [])
    ).toArray();
    assertEquals(lines[1]!.symbolicOperands, ["1", "2"]);
});

Deno.test("If parameters are provided for macro they must be an array", () => {
    const environment = testEnvironment();
    const result = environment.context.value(
        'macro("with", {"a": "a", "b": "b"});'
    );
    assertFailureWithExtra(result, "type_strings", "object");
});

Deno.test("... of strings", () => {
    const environment = testEnvironment();
    const result = environment.context.value(
        'macro("with", ["a", 2, "b", 3]);'
    );
    assertFailureWithExtra(
        result, "type_strings", "1: number, 3: number"
    );
});

Deno.test("If macro parameters are provided for useMacro they must be an array", () => {
    const environment = testEnvironment();

    environment.context.value(
        'macro("with", ["a", "b"]);'
    );
    environment.macroProcessor.lines(
        testLine("", "TST", ["a", "b"])
    ).toArray();
    environment.context.value("end();");

    const result = environment.context.value(
        'useMacro("with", {"a": "a", "b": "b"});'
    );
    assertFailureWithExtra(result, "type_macroParams", "object");
});

Deno.test("... of strings or numbers", () => {
    const environment = testEnvironment();

    environment.context.value(
        'macro("with", ["a", "b"]);'
    );
    environment.macroProcessor.lines(
        testLine("", "TST", ["a", "b"])
    ).toArray();
    environment.context.value("end();");

    const result = environment.context.value(
        'useMacro("with", [true, "a", 2, {"c": "c"}]);'
    );
    assertFailureWithExtra(result, "type_macroParams", "0: boolean, 3: object");
});
