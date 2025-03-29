import { assertEquals } from "jsr:@std/assert";
import { emptyBag, stringBag } from "../assembler/bags.ts";
import { bagOfFailures, clueFailure, Failure } from "../failure/bags.ts";
import { assertFailureKind, assertFailureWithExtra, assertSuccess, assertSuccessWith } from "../failure/testing.ts";
import { directiveFunction } from "./directive-function.ts";

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
        "it": () => bagOfFailures([clueFailure("file_notFound", "" )])
    });

    const result = untyped();
    assertEquals(result.type, "failures");
    assertFailureKind(result.it as Array<Failure>, "file_notFound");
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
    assertEquals(result.type, "failures");
    assertFailureWithExtra(result.it as Array<Failure>, "parameter_count", ["0"]);
});

Deno.test("A string directive has a single string parameter", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "stringDirective",
        "it": (parameter: string) => stringBag(parameter)
    });

    const first = untyped();
    assertEquals(first.type, "failures");
    assertFailureWithExtra(
        first.it as Array<Failure>, "parameter_count", ["1"]
    );

    const second = untyped("1", "2");
    assertEquals(second.type, "failures");
    assertFailureWithExtra(
        second.it as Array<Failure>, "parameter_count", ["1"]
    );

    const third = untyped(4);
    assertEquals(third.type, "failures");
    assertFailureWithExtra(
        third.it as Array<Failure>, "parameter_type", ["string", "0: number"]
    );

    const fourth = untyped(true);
    assertEquals(fourth.type, "failures");
    assertFailureWithExtra(
        fourth.it as Array<Failure>, "parameter_type", ["string", "0: boolean"]
    );

    assertSuccessWith(untyped("this works"), "this works");
});

Deno.test("A NumberDirective has a single number or numeric string parameter", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "numberDirective",
        "it": (parameter: number) => stringBag(`${parameter}`)
    });

    const result = untyped("five");
    assertEquals(result.type, "failures");
    assertFailureWithExtra(
        result.it as Array<Failure>, "parameter_type", ["number", "0: string"]
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
    assertEquals(first.type, "failures");
    assertFailureWithExtra(
        first.it as Array<Failure>, "parameter_type", ["string", "0: number"]
    );

    const second = untyped("plop", "plop");
    assertEquals(second.type, "failures");
    assertFailureWithExtra(
        second.it as Array<Failure>, "parameter_type", ["number", "1: string"]
    );

    assertSuccessWith(untyped("plop", 23), "plop = 23");
});

Deno.test("A DataDirective has any number of string or numeric parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "dataDirective",
        "it": (_data: Array<string | number>) => emptyBag()
    });

    const first = untyped(false);
    assertEquals(first.type, "failures");
    assertFailureWithExtra(
        first.it as Array<Failure>, "parameter_type", ["string, number", "0: boolean"]
    );

    const second = untyped({}, []);
    assertEquals(second.type, "failures");
    assertFailureWithExtra(
        second.it as Array<Failure>, "parameter_type", ["string, number", "0: object", "1: array"]
    );

    assertSuccess(untyped("hello", 2, 3, "goodbye"));
});

Deno.test("A FunctionUseDirective also has any number of string or numeric parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "functionUseDirective",
        "it": (_name: string, _parameters: Array<string | number>) => emptyBag()
    });

    const first = untyped(false);
    assertEquals(first.type, "failures");
    assertFailureWithExtra(
        first.it as Array<Failure>, "parameter_type", ["string, number", "0: boolean"]
    );

    const second = untyped({}, []);
    assertEquals(second.type, "failures");
    assertFailureWithExtra(
        second.it as Array<Failure>, "parameter_type", ["string, number", "0: object", "1: array"]
    );

    assertSuccess(untyped("hello", 2, 3, "goodbye"));
});

Deno.test("A FunctionDefineDirective has any number of string parameters", () => {
    const untyped = directiveFunction(irrelevantName, {
        "type": "functionDefineDirective",
        "it": (_name: string, _parameters: Array<string | number>) => emptyBag()
    });

    const first = untyped(false);
    assertEquals(first.type, "failures");
    assertFailureWithExtra(
        first.it as Array<Failure>, "parameter_type", ["string", "0: boolean"]
    );

    const second = untyped(1, "two", 3);
    assertEquals(second.type, "failures");
    assertFailureWithExtra(
        second.it as Array<Failure>, "parameter_type", ["string", "0: number", "2: number"]
    );

    assertSuccess(untyped("hello", "goodbye"));
});
