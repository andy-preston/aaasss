import { assertEquals } from "assert";
import {
    assertFailure, assertSuccess
} from "../coupling/value-failure-testing.ts";
import {
    box, failure, type Box, type Failure
} from "../coupling/value-failure.ts";
import { anEmptyContext } from "./context.ts";

Deno.test("Any directives that are added can be called as functions", () => {
    const context = anEmptyContext();
    let directiveParameter = "";
    const testDirective = (parameter: string): Box<string> | Failure => {
        directiveParameter = parameter;
        return box("");
    };
    context.directive("testDirective", testDirective);

    context.value("testDirective('says hello')");
    assertEquals(directiveParameter, "says hello");
});

Deno.test("Directives can return a failure", () => {
    const context = anEmptyContext();

    const testDirective = (_: string): Box<string> | Failure => {
        return failure(undefined, "file.notFound", undefined);
    };
    context.directive("testDirective", testDirective);

    const result = context.value("testDirective('')");
    assertFailure(result, "file.notFound");
});

Deno.test("Directives can return success in the form of a string", () => {
    const context = anEmptyContext();

    const testDirective = (_: string): Box<string> | Failure => {
        return box("");
    };
    context.directive("testDirective", testDirective);

    const result = context.value("testDirective('')");
    assertSuccess(result, "");
});
