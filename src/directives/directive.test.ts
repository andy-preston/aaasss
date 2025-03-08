import { assertEquals } from "assert";
import { stringBag } from "../assembler/bags.ts";
import { extractedFailures, bagOfFailures } from "../failure/bags.ts";
import { directiveFunction } from "./directive-function.ts";
import { emptyBag } from "../assembler/bags.ts";
import { assertFailureKind, assertFailures, assertFailureWithExtra, assertSuccess, assertSuccessWith } from "../failure/testing.ts";

const irrelevantName = "testing";

Deno.test("Any directives that are added can be called as functions", () => {
    let directiveParameter = "";
    const untyped = directiveFunction(irrelevantName, {
        "type": "stringDirective",
        "it": (parameter: string) => {
            directiveParameter = parameter;
            return emptyBag();
        }
    });
    assertSuccess(untyped("says hello"));
    assertEquals(directiveParameter, "says hello");
});

Deno.test("Directives can return a failure", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "voidDirective",
        "it": () => bagOfFailures([{ "kind": "file_notFound", message: "" }])
    });

    const result = untyped();
    assertFailures(result);
    assertFailureKind(extractedFailures(result), "file_notFound");
});

Deno.test("Directives can return success in the form of an empty box", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "voidDirective",
        "it": () => { return emptyBag(); }
    });
    assertSuccess(untyped());
});

Deno.test("A VoidDirective has no parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "voidDirective",
        "it": () => stringBag("hello")
    });
    assertSuccessWith(untyped(), "hello");
    const result = untyped("parameter");
    assertFailures(result);
    assertFailureWithExtra(extractedFailures(result), "parameter_count", ["0"]);
});

Deno.test("A string directive has a single string parameter", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "stringDirective",
        "it": (parameter: string) => stringBag(parameter)
    });

    const first = untyped();
    assertFailures(first);
    assertFailureWithExtra(
        extractedFailures(first), "parameter_count", ["1"]
    );

    const second = untyped("1", "2");
    assertFailures(second);
    assertFailureWithExtra(
        extractedFailures(second), "parameter_count", ["1"]
    );

    const third = untyped(4);
    assertFailures(third);
    assertFailureWithExtra(
        extractedFailures(third), "parameter_type", ["string", "0: number"]
    );

    const fourth = untyped(true);
    assertFailures(fourth);
    assertFailureWithExtra(
        extractedFailures(fourth), "parameter_type", ["string", "0: boolean"]
    );

    assertSuccessWith(untyped("this works"), "this works");
});

Deno.test("A NumberDirective has a single number or numeric string parameter", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "numberDirective",
        "it": (parameter: number) => stringBag(`${parameter}`)
    });

    const result = untyped("five");
    assertFailures(result);
    assertFailureWithExtra(
        extractedFailures(result), "parameter_type", ["number", "0: string"]
    );

    assertSuccessWith(untyped("99"), "99");
    assertSuccessWith(untyped(57), "57");
});

Deno.test("A ValueDirective has a string and a numeric parameter", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "valueDirective",
        "it": (valueName: string, actualValue: number) =>
            stringBag(`${valueName} = ${actualValue}`)
    });
    // This error reporting could be much, much nicer!
    const first = untyped(23, "plop");
    assertFailures(first);
    assertFailureWithExtra(
        extractedFailures(first), "parameter_type", ["string", "0: number"]
    );

    const second = untyped("plop", "plop");
    assertFailures(second);
    assertFailureWithExtra(
        extractedFailures(second), "parameter_type", ["number", "1: string"]
    );

    assertSuccessWith(untyped("plop", 23), "plop = 23");
});

Deno.test("A DataDirective has any number of string or numeric parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "dataDirective",
        "it": (_data: Array<string | number>) => emptyBag()
    });

    const first = untyped(false);
    assertFailures(first);
    assertFailureWithExtra(
        extractedFailures(first), "parameter_type", ["string, number", "0: boolean"]
    );

    const second = untyped({}, []);
    assertFailures(second);
    assertFailureWithExtra(
        extractedFailures(second), "parameter_type", ["string, number", "0: object", "1: array"]
    );

    assertSuccess(untyped("hello", 2, 3, "goodbye"));
});

Deno.test("A FunctionUseDirective also has any number of string or numeric parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "functionUseDirective",
        "it": (_name: string, _parameters: Array<string | number>) => emptyBag()
    });

    const first = untyped(false);
    assertFailures(first);
    assertFailureWithExtra(
        extractedFailures(first), "parameter_type", ["string, number", "0: boolean"]
    );

    const second = untyped({}, []);
    assertFailures(second);
    assertFailureWithExtra(
        extractedFailures(second), "parameter_type", ["string, number", "0: object", "1: array"]
    );

    assertSuccess(untyped("hello", 2, 3, "goodbye"));
});

Deno.test("A FunctionDefineDirective has any number of string parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "functionDefineDirective",
        "it": (_name: string, _parameters: Array<string | number>) => emptyBag()
    });

    const first = untyped(false);
    assertFailures(first);
    assertFailureWithExtra(
        extractedFailures(first), "parameter_type", ["string", "0: boolean"]
    );

    const second = untyped(1, "two", 3);
    assertFailures(second);
    assertFailureWithExtra(
        extractedFailures(second), "parameter_type", ["string", "0: number", "2: number"]
    );

    assertSuccess(untyped("hello", "goodbye"));
});
