import { assertEquals } from "assert/equals";
import { assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { anEmptyContext } from "../javascript/context.ts";
import { processor } from "./processor.ts";
import { testLine } from "./testing.ts";

const testEnvironment = () => {
    const context = anEmptyContext();
    const macroProcessor = processor();
    context.directive("define", macroProcessor.define);
    context.directive("end", macroProcessor.end);
    context.directive("macro", macroProcessor.macro);
    return {
        "context": context,
        "macroProcessor": macroProcessor
    };
};

Deno.test("The define directive name must be a string", () => {
    const environment = testEnvironment();
    const result = environment.context.value("define(47);");
    assertFailureWithExtra(result, "type_string", "47");
});

Deno.test("The macro directive name must be a string", () => {
    const environment = testEnvironment();
    const result = environment.context.value('macro(47);');
    assertFailureWithExtra(result, "type_string", "47");
});

Deno.test("The define directive can be called without parameters", () => {
    const environment = testEnvironment();
    const result = environment.context.value('define("without");');
    assertSuccess(result, undefined);
});

Deno.test("The define directive can be called with parameters", () => {
    const environment = testEnvironment();
    assertSuccess(
        environment.context.value('define("with", ["a", "b"]);'),
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
        environment.context.value('macro("with", ["1", "2"]);'),
        undefined
    );
    const lines = environment.macroProcessor.lines(
        testLine("", "", [])
    ).toArray();
    assertEquals(lines[1]!.symbolicOperands, ["1", "2"]);
});

Deno.test("If define parameters are provided for define they must be an array", () => {
    const environment = testEnvironment();
    const defineResult = environment.context.value(
        'define("with", {"a": "a", "b": "b"});'
    );
    assertFailureWithExtra(defineResult, "type_strings", "object");
});

Deno.test("... of strings", () => {
    const environment = testEnvironment();
    const defineResult = environment.context.value(
        'define("with", ["a", 2, "b", 3]);'
    );
    assertFailureWithExtra(
        defineResult, "type_strings", "1: number, 3: number"
    );
});

Deno.test("If macro parameters are provided for define they must be an array", () => {
    const environment = testEnvironment();

    environment.context.value(
        'define("with", ["a", "b"]);'
    );
    environment.macroProcessor.lines(
        testLine("", "TST", ["a", "b"])
    ).toArray();
    environment.context.value("end();");

    const result = environment.context.value(
        'macro("with", {"a": "a", "b": "b"});'
    );
    assertFailureWithExtra(result, "type_macroParams", "object");
});

Deno.test("... of strings or numbers", () => {
    const environment = testEnvironment();

    environment.context.value(
        'define("with", ["a", "b"]);'
    );
    environment.macroProcessor.lines(
        testLine("", "TST", ["a", "b"])
    ).toArray();
    environment.context.value("end();");

    const result = environment.context.value(
        'macro("with", [true, "a", 2, {"c": "c"}]);'
    );
    assertFailureWithExtra(result, "type_macroParams", "0: boolean, 3: object");
});
