import { assertEquals } from "assert/equals";
import { anEmptyContext } from "../context/context.ts";
import { lineWithRenderedJavascript } from "../embedded-js/line-types.ts";
import { assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import type { Label, Mnemonic } from "../source-code/data-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { processor } from "./processor.ts";

const testLine = (
    label: Label, mnemonic: Mnemonic, operands: SymbolicOperands
) => {
    const raw = lineWithRawSource("", 0, false, "");
    const rendered = lineWithRenderedJavascript(raw, "", []);
    return lineWithTokens(rendered, label, mnemonic, operands, []);
};

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
    assertSuccess(result, "without");
});

Deno.test("The define directive can be called with parameters", () => {
    const environment = testEnvironment();

    const defineResult = environment.context.value(
        'define("with", ["a", "b"]);'
    );
    assertSuccess(defineResult, "with");
    environment.macroProcessor.lines(
        testLine("", "TST", ["a", "b"])
    ).toArray();
    const endResult = environment.context.value("end();");
    assertSuccess(endResult, "with");

    const macroResult = environment.context.value(
        'macro("with", ["1", "2"]);'
    );
    assertSuccess(macroResult, "with");
    const lines = environment.macroProcessor.lines(
        testLine("", "", [])
    ).toArray();
    assertEquals(lines[0]!.symbolicOperands, ["1", "2"]);
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
    assertFailureWithExtra(result, "type_params", "object");
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
    assertFailureWithExtra(result, "type_params", "0: boolean, 3: object");
});
