import { assertEquals } from "assert/equals";
import { anEmptyContext } from "../context/context.ts";
import {
    assertFailureWithExtra, assertSuccess
} from "../coupling/value-failure-testing.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import type { Label, Mnemonic } from "../source-code/data-types.ts";
import {
    lineWithRawSource, lineWithRenderedJavascript
} from "../source-code/line-types.ts";
import { lineWithTokens } from "../tokenise/line-types.ts";
import { processor } from "./processor.ts";

const testLine = (
    label: Label, mnemonic: Mnemonic, operands: SymbolicOperands
) => {
    const raw = lineWithRawSource("", 0, "", []);
    const rendered = lineWithRenderedJavascript(raw, "", []);
    return lineWithTokens(rendered, label, mnemonic, operands, []);
};

Deno.test("The define directive name must be a string", () => {
    const context = anEmptyContext();
    const macroProcessor = processor();
    context.directive("define", macroProcessor.defineDirective);
    const result = context.value("define(47);");
    assertFailureWithExtra(result, "type.string", "47");
});

Deno.test("The macro directive name must be a string", () => {
    const context = anEmptyContext();
    const macroProcessor = processor();
    context.directive("macro", macroProcessor.macroDirective);
    const result = context.value('macro(47);');
    assertFailureWithExtra(result, "type.string", "47");
});

Deno.test("The define directive can be called without parameters", () => {
    const context = anEmptyContext();
    const macroProcessor = processor();
    context.directive("define", macroProcessor.defineDirective);
    const result = context.value('define("without");');
    assertSuccess(result, "without");
});

Deno.test("The define directive can be called with parameters", () => {
    const context = anEmptyContext();
    const macroProcessor = processor();
    context.directive("define", macroProcessor.defineDirective);
    context.directive("end", macroProcessor.endDirective);
    context.directive("macro", macroProcessor.macroDirective);

    const defineResult = context.value('define("with", ["a", "b"]);');
    assertSuccess(defineResult, "with");
    macroProcessor.lines(testLine("", "TST", ["a", "b"])).toArray();
    const endResult = context.value("end();");
    assertSuccess(endResult, "with");

    const macroResult = context.value('macro("with", ["1", "2"]);');
    assertSuccess(macroResult, "with");
    const lines = macroProcessor.lines(testLine("", "", [])).toArray();
    assertEquals(lines[0]!.symbolicOperands, ["1", "2"]);
});

Deno.test("If define parameters are provided for define they must be an array", () => {
    const context = anEmptyContext();
    const macroProcessor = processor();
    context.directive("define", macroProcessor.defineDirective);
    const defineResult = context.value('define("with", {"a": "a", "b": "b"});');
    assertFailureWithExtra(defineResult, "type.strings", "object");
});

Deno.test("... of strings", () => {
    const context = anEmptyContext();
    const macroProcessor = processor();
    context.directive("define", macroProcessor.defineDirective);
    const defineResult = context.value('define("with", ["a", 2, "b", 3]);');
    assertFailureWithExtra(defineResult, "type.strings", "1: number, 3: number");
});

Deno.test("If macro parameters are provided for define they must be an array", () => {
    const context = anEmptyContext();
    const macroProcessor = processor();
    context.directive("define", macroProcessor.defineDirective);
    context.directive("end", macroProcessor.endDirective);
    context.directive("macro", macroProcessor.macroDirective);

    context.value('define("with", ["a", "b"]);');
    macroProcessor.lines(testLine("", "TST", ["a", "b"])).toArray();
    context.value("end();");

    const result = context.value('macro("with", {"a": "a", "b": "b"});');
    assertFailureWithExtra(result, "type.params", "object");
});

Deno.test("... of strings or numbers", () => {
    const context = anEmptyContext();
    const macroProcessor = processor();
    context.directive("define", macroProcessor.defineDirective);
    context.directive("end", macroProcessor.endDirective);
    context.directive("macro", macroProcessor.macroDirective);

    context.value('define("with", ["a", "b"]);');
    macroProcessor.lines(testLine("", "TST", ["a", "b"])).toArray();
    context.value("end();");

    const result = context.value('macro("with", [true, "a", 2, {"c": "c"}]);');
    assertFailureWithExtra(result, "type.params", "0: boolean, 3: object");
});
