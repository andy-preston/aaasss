import { assertEquals } from "assert";
import { box, failure } from "../failure/failure-or-box.ts";
import { assertFailure, assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { directiveFunction } from "./directive-function.ts";

Deno.test("Any directives that are added can be called as functions", () => {
    let directiveParameter = "";
    const untyped = directiveFunction("test", {
        "type": "stringDirective",
        "body": (parameter: string)=> {
            directiveParameter = parameter;
            return box("");
        }
    });
    assertSuccess(untyped("says hello"), "");
    assertEquals(directiveParameter, "says hello");
});

Deno.test("Directives can return a failure", () => {
    const untyped = directiveFunction("test", {
        "type": "voidDirective",
        "body": () => {
            return failure(undefined, "file_notFound", undefined);
        }
    });
    assertFailure(untyped(), "file_notFound");
});

Deno.test("Directives can return success in the form of an empty box", () => {
    const untyped = directiveFunction("test", {
        "type": "voidDirective",
        "body": () => {
            return box("");
        }
    });
    assertSuccess(untyped(), "");
});

Deno.test("A VoidDirective has no parameters", () => {
    const untyped = directiveFunction("test", {
        "type": "voidDirective",
        "body": () => box("hello")
    });
    assertSuccess(untyped(), "hello");
    assertFailureWithExtra(untyped("parameter"), "parameter_count", ["0"]);
});

Deno.test("A string directive has a single string parameter", () => {
    const untyped = directiveFunction("test", {
        "type": "stringDirective",
        "body": (parameter: string) => box(parameter)
    });
    assertFailureWithExtra(untyped(), "parameter_count", ["1"]);
    assertFailureWithExtra(untyped("1", "2"), "parameter_count", ["1"]);
    assertFailureWithExtra(untyped(4), "parameter_type", ["string", "0: number"]);
    assertFailureWithExtra(untyped(true), "parameter_type", ["string", "0: boolean"]);
    assertSuccess(untyped("this works"), "this works");
});

Deno.test("A NumberDirective has a single number or numeric string parameter", () => {
    const untyped = directiveFunction("test", {
        "type": "numberDirective",
        "body": (parameter: number) => box(`${parameter}`)
    });
    assertFailureWithExtra(untyped("five"), "parameter_type", ["number", "0: string"]);
    assertSuccess(untyped("99"), "99");
    assertSuccess(untyped(57), "57");
});

Deno.test("A ValueDirective has a string and a numeric parameter", () => {
    const untyped = directiveFunction("test", {
        "type": "valueDirective",
        "body": (valueName: string, actualValue: number) =>
            box(`${valueName} = ${actualValue}`)
    });
    // This error reporting could be much, much nicer!
    assertFailureWithExtra(
        untyped(23, "plop"),
        "parameter_type", ["string", "0: number"]
    );
    assertFailureWithExtra(
        untyped("plop", "plop"),
        "parameter_type", ["number", "1: string"]
    );
    assertSuccess(untyped("plop", 23), "plop = 23");
});
