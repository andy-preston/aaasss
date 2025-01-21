import { assertEquals } from "assert";
import type { Directive } from "../directives/data-types.ts";
import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { emptyBox, failure } from "../failure/failure-or-box.ts";
import { testContext } from "./testing.ts";

Deno.test("Any directives that are added can be called as functions", () => {
    const context = testContext();
    let directiveParameter = "";
    const testDirective: Directive = (parameter: string)=> {
        directiveParameter = parameter;
        return emptyBox();
    };
    context.directive("testDirective", testDirective);

    context.value("testDirective('says hello')");
    assertEquals(directiveParameter, "says hello");
});

Deno.test("Directives can return a failure", () => {
    const context = testContext();

    const testDirective: Directive = (_: string) => {
        return failure(undefined, "file_notFound", undefined);
    };
    context.directive("testDirective", testDirective);

    const result = context.value("testDirective('')");
    assertFailure(result, "file_notFound");
});

Deno.test("Directives can return success in the form of a string", () => {
    const context = testContext();

    const testDirective: Directive = (_: string) => {
        return emptyBox();
    };
    context.directive("testDirective", testDirective);

    const result = context.value("testDirective('')");
    assertSuccess(result, undefined);
});
