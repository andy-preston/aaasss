import { assertEquals } from "assert";
import { anEmptyContext } from "../testing.ts";
import { box, failure, type Box, type Failure } from "../value-or-failure.ts";

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
        return failure(undefined, "notFound", undefined);
    };
    context.directive("testDirective", testDirective);

    const result = context.value("testDirective('')");
    assertEquals(result.which, "failure");
    assertEquals((result as Failure).kind, "notFound");
});

Deno.test("Directives can return success", () => {
    const context = anEmptyContext();

    const testDirective = (_: string): Box<string> | Failure => {
        return box("");
    };
    context.directive("testDirective", testDirective);

    const result = context.value("testDirective('')");
    assertEquals(result.which, "box");
    assertEquals((result as Box<string>).value, "");
});
