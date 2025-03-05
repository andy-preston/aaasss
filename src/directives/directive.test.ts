import { assertEquals } from "assert";
import { box, failure } from "../failure/failure-or-box.ts";
import { assertFailure, assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { directiveFunction } from "./directive-function.ts";

const irrelevantName = "testing";

Deno.test("Any directives that are added can be called as functions", () => {
    let directiveParameter = "";
    const untyped = directiveFunction(irrelevantName, {
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
    const untyped = directiveFunction(irrelevantName, {
        "type": "voidDirective",
        "body": () => {
            return failure(undefined, "file_notFound", undefined);
        }
    });
    assertFailure(untyped(), "file_notFound");
});

Deno.test("Directives can return success in the form of an empty box", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "voidDirective",
        "body": () => {
            return box("");
        }
    });
    assertSuccess(untyped(), "");
});

Deno.test("A VoidDirective has no parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "voidDirective",
        "body": () => box("hello")
    });
    assertSuccess(untyped(), "hello");
    assertFailureWithExtra(untyped("parameter"), "parameter_count", ["0"]);
});

Deno.test("A string directive has a single string parameter", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "stringDirective",
        "body": (parameter: string) => box(parameter)
    });
    assertFailureWithExtra(
        untyped(), "parameter_count", ["1"]
    );
    assertFailureWithExtra(
        untyped("1", "2"), "parameter_count", ["1"]
    );
    assertFailureWithExtra(
        untyped(4), "parameter_type", ["string", "0: number"]
    );
    assertFailureWithExtra(
        untyped(true), "parameter_type", ["string", "0: boolean"]
    );
    assertSuccess(untyped("this works"), "this works");
});

Deno.test("A NumberDirective has a single number or numeric string parameter", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "numberDirective",
        "body": (parameter: number) => box(`${parameter}`)
    });
    assertFailureWithExtra(
        untyped("five"), "parameter_type", ["number", "0: string"]
    );
    assertSuccess(untyped("99"), "99");
    assertSuccess(untyped(57), "57");
});

Deno.test("A ValueDirective has a string and a numeric parameter", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "valueDirective",
        "body": (valueName: string, actualValue: number) =>
            box(`${valueName} = ${actualValue}`)
    });
    // This error reporting could be much, much nicer!
    assertFailureWithExtra(
        untyped(23, "plop"), "parameter_type", ["string", "0: number"]
    );
    assertFailureWithExtra(
        untyped("plop", "plop"), "parameter_type", ["number", "1: string"]
    );
    assertSuccess(untyped("plop", 23), "plop = 23");
});

Deno.test("A DataDirective has any number of string or numeric parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "dataDirective",
        "body": (_data: Array<string | number>) => box("")
    });
    assertFailureWithExtra(
        untyped(false),
        "parameter_type", ["string, number", "0: boolean"]
    ),
    assertFailureWithExtra(
        untyped({}, []),
        "parameter_type", ["string, number", "0: object", "1: array"]
    ),
    assertSuccess(untyped("hello", 2, 3, "goodbye"), "");
});

Deno.test("A FunctionUseDirective also has any number of string or numeric parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "functionUseDirective",
        "body": (_name: string, _parameters: Array<string | number>) => box("")
    });
    assertFailureWithExtra(
        untyped(false),
        "parameter_type", ["string, number", "0: boolean"]
    ),
    assertFailureWithExtra(
        untyped({}, []),
        "parameter_type", ["string, number", "0: object", "1: array"]
    ),
    assertSuccess(untyped("hello", 2, 3, "goodbye"), "");
});

Deno.test("A FunctionDefineDirective has any number of string parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "functionDefineDirective",
        "body": (_name: string, _parameters: Array<string | number>) => box("")
    });
    assertFailureWithExtra(
        untyped(false),
        "parameter_type", ["string", "0: boolean"]
    ),
    assertFailureWithExtra(
        untyped(1, "two", 3),
        "parameter_type", ["string", "0: number", "2: number"]
    ),
    assertSuccess(untyped("hello", "goodbye"), "");
});
