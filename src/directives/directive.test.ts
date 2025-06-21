import type { AssertionFailure, BoringFailure } from "../failure/bags.ts";
import type { DirectiveResult } from "./data-types.ts";

import { expect } from "jsr:@std/expect";
import { currentLine } from "../line/current-line.ts";
import { emptyLine } from "../line/line-types.ts";
import { directiveFunction } from "./directives.ts";

const testSystem = () => {
    const $currentLine = currentLine();
    $currentLine(emptyLine("plop.asm"));
    const $directiveFunction = directiveFunction($currentLine);
    return {
        "currentLine": $currentLine,
        "directiveFunction": $directiveFunction
    }
};

Deno.test("Any directives that are added can be called as functions", () => {
    const systemUnderTest = testSystem();
    let directiveParameter = "";
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "stringDirective",
        "it": (parameter: string): DirectiveResult =>
            directiveParameter = parameter
    });
    untyped("says hello");
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(directiveParameter).toBe("says hello");
});

Deno.test("Directives can return a string, 'void' or undefined", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "voidDirective",
        "it": () => "hello"
    });
    expect(untyped()).toBe("hello");
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
});

Deno.test("A VoidDirective has no parameters", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "voidDirective",
        "it": () => "hello"
    });
    expect(untyped()).toBe("hello");
    expect(systemUnderTest.currentLine().failures.length).toBe(0);

    expect(untyped("not void")).toBe("hello");
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as AssertionFailure;
    expect(failure.kind).toBe("parameter_count");
    expect(failure.expected).toBe("0");
    expect(failure.actual).toBe("1");
});

Deno.test("A StringDirective can't have zero parameters", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "stringDirective",
        "it": (parameter: string) => parameter
    });
    expect(untyped()).toBe(undefined);
    expect(systemUnderTest.currentLine().failures.length).toBe(2);
    {
        const failure = systemUnderTest.currentLine().failures[0] as AssertionFailure;
        expect(failure.kind).toBe("parameter_count");
        expect(failure.expected).toBe("1");
        expect(failure.actual).toBe("0");
    } {
        const failure = systemUnderTest.currentLine().failures[1] as AssertionFailure;
        expect(failure.kind).toBe("value_type");
        expect(failure.expected).toBe("string");
        expect(failure.actual).toBe("undefined (undefined)");
        expect(failure.location).toEqual({"parameter": 1});
    }
});

Deno.test("A StringDirective can't have more than 1 parameter", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "stringDirective",
        "it": (parameter: string) => parameter
    });
    expect(untyped("1", "2")).toBe("1");
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as AssertionFailure;
    expect(failure.kind).toBe("parameter_count");
    expect(failure.expected).toBe("1");
    expect(failure.actual).toBe("2");
});

Deno.test("A StringDirective can't have a number parameter", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "stringDirective",
        "it": (parameter: string) => parameter
    });
    expect(untyped(4)).toBe("4");
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as AssertionFailure;
    expect(failure.kind).toBe("value_type");
    expect(failure.expected).toBe("string");
    expect(failure.actual).toBe("number (4)");
    expect(failure.location).toEqual({"parameter": 1});
});

Deno.test("A StringDirective can't have a boolean parameters", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "stringDirective",
        "it": (parameter: string) => parameter
    });
    expect(untyped(false)).toBe("false");
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure =
        systemUnderTest.currentLine().failures[0] as AssertionFailure;
    expect(failure.kind).toBe("value_type");
    expect(failure.expected).toBe("string");
    expect(failure.actual).toBe("boolean (false)");
    expect(failure.location).toEqual({"parameter": 1});
});

Deno.test("A StringDirective has a single string parameter", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "stringDirective",
        "it": (parameter: string) => parameter
    });
    expect(untyped("this works")).toBe("this works");
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
});

Deno.test("A NumberDirective can't have a non-numeric string parameter", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "numberDirective",
        "it": (parameter: number) => `${parameter}`
    });
    expect(untyped("five")).toBe("0");
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as AssertionFailure;
    expect(failure.kind).toBe("type_failure");
    expect(failure.expected).toBe("numeric");
    expect(failure.actual).toBe('"five"');
});

Deno.test("A NumberDirective has a single number or NUMERIC string parameter", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "numberDirective",
        "it": (parameter: number) => `${parameter}`
    });
    expect(untyped("99")).toBe("99");
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(untyped(57)).toBe("57");
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
});

Deno.test("A BooleanDirective can't have more than 1 parameter", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "booleanDirective",
        "it": (parameter: boolean) => `${parameter}`
    });
    expect(untyped(false, true)).toBe("false");
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as AssertionFailure;
    expect(failure.kind).toBe("parameter_count");
    expect(failure.expected).toBe("1");
    expect(failure.actual).toBe("2");
});

Deno.test("A BooleanDirective has a single parameter of any type", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "booleanDirective",
        "it": (parameter: boolean) => `${parameter}`
    });
    (["true", 1, 1000, {}] as Array<unknown>).forEach(truthy => {
        expect(untyped(truthy)).toBe("true");
        expect(systemUnderTest.currentLine().failures.length).toBe(0);
    });
    (["", 0, -0, undefined, null] as Array<unknown>).forEach(falsy => {
        expect(untyped(falsy)).toBe("false");
        expect(systemUnderTest.currentLine().failures.length).toBe(0);
    });
});

Deno.test("A ValueDirective can't have a number as the first parameter", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "valueDirective",
        "it": (valueName: string, actualValue: number) =>
            `${valueName} = ${actualValue}`
    });
    expect(untyped(23, 2)).toBe("23 = 2");
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as BoringFailure;
    expect(failure.kind).toBe("parameter_firstName");
});

Deno.test("A ValueDirective can't have a non-numeric string as the second parameter", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "valueDirective",
        "it": (valueName: string, actualValue: number) =>
            `${valueName} = ${actualValue}`
    });
    expect(untyped("plop", "five")).toBe("plop = 0");
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as AssertionFailure;

    expect(failure.kind).toBe("type_failure");
    expect(failure.expected).toBe("numeric");
    expect(failure.actual).toBe('"five"');
});

Deno.test("A ValueDirective has a string and a NUMERIC parameter", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "valueDirective",
        "it": (valueName: string, actualValue: number) =>
            `${valueName} = ${actualValue}`
    });
    expect(untyped("plop", "23")).toBe("plop = 23");
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(untyped("plop", 23)).toBe("plop = 23");
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
});

Deno.test("A DataDirective can't have boolean parameters", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "dataDirective",
        "it": (_data: Array<string | number>) => ""
    });
    expect(untyped(false)).toBe("");
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as AssertionFailure;
    expect(failure.kind).toBe("value_type");
    expect(failure.expected).toBe("string, number");
    expect(failure.actual).toBe("boolean (false)");
    expect(failure.location).toEqual({"parameter": 1});
});

Deno.test("A DataDirective can't have object or array parameters", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "dataDirective",
        "it": (_data: Array<string | number>) => ""
    });
    expect(untyped({}, [])).toBe("");
    expect(systemUnderTest.currentLine().failures.length).toBe(2);
    {
        const failure = systemUnderTest.currentLine().failures[0] as AssertionFailure;
        expect(failure.kind).toBe("value_type");
        expect(failure.expected).toBe("string, number");
        expect(failure.actual).toBe("object ([object Object])");
        expect(failure.location).toEqual({"parameter": 1});
    } {
        const failure = systemUnderTest.currentLine().failures[1] as AssertionFailure;
        expect(failure.kind).toBe("value_type");
        expect(failure.expected).toBe("string, number");
        expect(failure.actual).toBe("array ()");
        expect(failure.location).toEqual({"parameter": 2});
    }
});

Deno.test("A DataDirective has any number of string or NUMERIC parameters", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "dataDirective",
        "it": (_data: Array<string | number>) => ""
    });
    expect(untyped("hello", 2, 3, "goodbye")).toBe("");
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
});

Deno.test("A FunctionUseDirective can't have boolean parameters", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "functionUseDirective",
        "it": (_name: string, _parameters: Array<string | number>) => ""
    });
    expect(untyped(false)).toBe("");
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as AssertionFailure;
    expect(failure.kind).toBe("value_type");
    expect(failure.expected).toBe("string, number");
    expect(failure.actual).toBe("boolean (false)");
    expect(failure.location).toEqual({"parameter": 1});
});

Deno.test("A FunctionUseDirective can't have object or array parameters", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "functionUseDirective",
        "it": (_name: string, _parameters: Array<string | number>) => ""
    });
    expect(untyped({}, [])).toBe("");
    expect(systemUnderTest.currentLine().failures.length).toBe(2);
    {
        const failure = systemUnderTest.currentLine().failures[0] as AssertionFailure;
        expect(failure.kind).toBe("value_type");
        expect(failure.expected).toBe("string, number");
        expect(failure.actual).toBe("object ([object Object])");
        expect(failure.location).toEqual({"parameter": 1});
    } {
        const failure = systemUnderTest.currentLine().failures[1] as AssertionFailure;
        expect(failure.kind).toBe("value_type");
        expect(failure.expected).toBe("string, number");
        expect(failure.actual).toBe("array ()");
        expect(failure.location).toEqual({"parameter": 2});
    }
});

Deno.test("A FunctionUseDirective has any number of string or NUMERIC parameters", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "functionUseDirective",
        "it": (_name: string, _parameters: Array<string | number>) => ""
    });
    expect(untyped("hello", 2, 3, "goodbye")).toBe("");
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
});

Deno.test("A FunctionDefineDirective can't have boolean parameters", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "functionDefineDirective",
        "it": (_name: string, _parameters: Array<string | number>) => ""
    });
    expect(untyped(false)).toBe("");
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as BoringFailure;
    expect(failure.kind).toBe("parameter_firstName");
});

Deno.test("A FunctionDefineDirective can't have object or array parameters", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "functionDefineDirective",
        "it": (_name: string, _parameters: Array<string | number>) => ""
    });
    expect(untyped({}, [])).toBe("");
    expect(systemUnderTest.currentLine().failures.length).toBe(2);
    {
        const failure = systemUnderTest.currentLine().failures[0] as BoringFailure;
        expect(failure.kind).toBe("parameter_firstName");
    } {
        const failure = systemUnderTest.currentLine().failures[1] as AssertionFailure;
        expect(failure.kind).toBe("value_type");
        expect(failure.expected).toBe("string");
        expect(failure.actual).toBe("array ()");
        expect(failure.location).toEqual({"parameter": 2});
    }
});

Deno.test("A FunctionDefineDirective has any number of string parameters", () => {
    const systemUnderTest = testSystem();
    const untyped = systemUnderTest.directiveFunction("plop", {
        "type": "functionDefineDirective",
        "it": (_name: string, _parameters: Array<string | number>) => ""
    });
    expect(untyped("hello", "goodbye")).toBe("");
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
});
