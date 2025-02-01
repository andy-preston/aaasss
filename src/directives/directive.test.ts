import { assertEquals } from "assert";
import { pass } from "../assembler/pass.ts";
import { emptyBox, failure } from "../failure/failure-or-box.ts";
import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { anEmptyContext } from "../javascript/context.ts";
import { jSExpression } from "../javascript/expression.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import type { Directive } from "./directive.ts";

export const testEnvironment = () => {
    const context = anEmptyContext();
    return {
        "directive": symbolTable(context, pass()).directive,
        "expression": jSExpression(context)
    };
};

Deno.test("Any directives that are added can be called as functions", () => {
    const environment = testEnvironment();
    let directiveParameter = "";
    const testDirective: Directive = (parameter: string)=> {
        directiveParameter = parameter;
        return emptyBox();
    };
    environment.directive("testDirective", testDirective);
    environment.expression("testDirective('says hello')");
    assertEquals(directiveParameter, "says hello");
});

Deno.test("Directives can return a failure", () => {
    const environment = testEnvironment();
    const testDirective: Directive = (_: string) => {
        return failure(undefined, "file_notFound", undefined);
    };
    environment.directive("testDirective", testDirective);
    const result = environment.expression("testDirective('')");
    assertFailure(result, "file_notFound");
});

Deno.test("Directives can return success in the form of a string", () => {
    const environment = testEnvironment();
    const testDirective: Directive = (_: string) => {
        return emptyBox();
    };
    environment.directive("testDirective", testDirective);
    const result = environment.expression("testDirective('')");
    assertSuccess(result, undefined);
});
