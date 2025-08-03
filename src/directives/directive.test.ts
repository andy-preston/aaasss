import type { DirectiveResult } from "./data-types.ts";

import { expect } from "jsr:@std/expect";
import { isFunction, testSystem } from "./testing.ts";

Deno.test("Any directives that are added can be called as functions", () => {
    let directiveParameter = "";
    const directiveBody = (parameter: string): DirectiveResult => {
        directiveParameter = parameter;
        return undefined;
    };
    const systemUnderTest = testSystem({
        "plop": [directiveBody, ["string"]]
    });
    const directive = systemUnderTest.symbolTable.internalValue("plop");
    if (isFunction(directive)) {
        directive("says hello");
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(directiveParameter).toBe("says hello");
});

Deno.test("Directives can return a string", () => {
    const directiveBody = (): DirectiveResult => "hello";
    const systemUnderTest = testSystem({
        "plop": [directiveBody, []]
    });
    const directive = systemUnderTest.symbolTable.internalValue("plop");
    const result = isFunction(directive) ? directive() : null;
    expect(result).toBe("hello");
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
});

Deno.test("Directives can return a number", () => {
    const directiveBody = (): DirectiveResult => 528;
    const systemUnderTest = testSystem({
        "plop": [directiveBody, []]
    });
    const directive = systemUnderTest.symbolTable.internalValue("plop");
    const result = isFunction(directive) ? directive() : null;
    expect(result).toBe(528);
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
});

Deno.test("Directives can return undefined", () => {
    const directiveBody = (): DirectiveResult => undefined;
    const systemUnderTest = testSystem({
        "plop": [directiveBody, []]
    });
    const directive = systemUnderTest.symbolTable.internalValue("plop");
    const result = isFunction(directive) ? directive() : null;
    expect(result).toBe(undefined);
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
});

Deno.test("Some directives have no parameters", () => {
    const directiveBody = (): DirectiveResult => "hello";
    const systemUnderTest = testSystem({
        "plop": [directiveBody, []]
    });
    const directive = systemUnderTest.symbolTable.internalValue("plop");
    const result = isFunction(directive) ? directive(null) : null;
    expect(result).not.toBe("hello");
    expect(result).toBe(undefined);
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "parameter_count", "location": undefined,
        "expected": "0", "actual": "1"
    }]);
});

Deno.test("A directive that expects parameters won't like getting none", () => {
    const directiveBody = (parameter: string): DirectiveResult => parameter;
    const systemUnderTest = testSystem({
        "plop": [directiveBody, ["string"]]
    });
    const directive = systemUnderTest.symbolTable.internalValue("plop");
    if (isFunction(directive)) {
        directive();
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "parameter_count", "location": undefined,
        "expected": "1", "actual": "0"
    }]);
});

Deno.test("Directives complain about too many parameters", () => {
    const directiveBody = (parameter: string): DirectiveResult => parameter;
    const systemUnderTest = testSystem({
        "plop": [directiveBody, ["string"]]
    });
    const directive = systemUnderTest.symbolTable.internalValue("plop");
    if (isFunction(directive)) {
        directive("plop", "plop");
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "parameter_count", "location": undefined,
        "expected": "1", "actual": "2"
    }]);
});

Deno.test("Parameters can be string number or boolean", () => {
    const directiveBody = (
        first: string, second: number, third: boolean
    ): DirectiveResult => `${first} ${second} ${third}`;
    const systemUnderTest = testSystem({
        "plop": [directiveBody, ["string", "number", "boolean"]]
    });
    const directive = systemUnderTest.symbolTable.internalValue("plop");
    const result = isFunction(directive) ? directive("hello", 42, false) : null;
    expect(result).toBe("hello 42 false");
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
});

Deno.test("Parameters of the wrong type give a failure", () => {
    const directiveBody = (parameter: string): DirectiveResult => parameter;
    const systemUnderTest = testSystem({
        "plop": [directiveBody, ["string", "number", "boolean"]]
    });
    const directive = systemUnderTest.symbolTable.internalValue("plop");
    if (isFunction(directive)) {
        directive([], {}, null);
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "parameter_type", "location": {"parameter": 1},
        "expected": "string", "actual": "array"
    }, {
        "kind": "parameter_type", "location": {"parameter": 2},
        "expected": "number", "actual": "object"
    }, {
        "kind": "parameter_type", "location": {"parameter": 3},
        "expected": "boolean", "actual": "object"
    }]);
});

Deno.test("Label parameters should follow the rules of the tokeniser", () => {
    const directiveBody = (parameter: string): DirectiveResult => parameter;
    const systemUnderTest = testSystem({
        "plop": [directiveBody, ["label", "label", "label"]]
    });
    const directive = systemUnderTest.symbolTable.internalValue("plop");
    if (isFunction(directive)) {
        directive("bad$dollar", "nice", "bad-dash");
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "syntax_invalidLabel", "location": {"parameter": 1}
    }, {
        "kind": "syntax_invalidLabel", "location": {"parameter": 3}
    }]);
});

Deno.test("Label parameters also check for strings", () => {
    const directiveBody = (parameter: string): DirectiveResult => parameter;
    const systemUnderTest = testSystem({
        "plop": [directiveBody, ["label"]]
    });
    const directive = systemUnderTest.symbolTable.internalValue("plop");
    if (isFunction(directive)) {
        directive(1);
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "parameter_type", "location": {"parameter": 1},
        "expected": "string", "actual": "number"
    }]);
});

Deno.test("Word parameters can't be negative or over FFFF", () => {
    const directiveBody = (parameter: string): DirectiveResult => parameter;
    const systemUnderTest = testSystem({
        "plop": [directiveBody, ["word", "word", "word"]]
    });
    const directive = systemUnderTest.symbolTable.internalValue("plop");
    if (isFunction(directive)) {
        directive(-1, 0xcafe, 0x10000);
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "parameter_value", "location": {"parameter": 1},
        "expected": "(word) 0-FFFF", "actual": "-1"
    }, {
        "kind": "parameter_value", "location": {"parameter": 3},
        "expected": "(word) 0-FFFF", "actual": "65536"
    }]);
});

Deno.test("Word parameters also check for numbers", () => {
    const directiveBody = (parameter: string): DirectiveResult => parameter;
    const systemUnderTest = testSystem({
        "plop": [directiveBody, ["word"]]
    });
    const directive = systemUnderTest.symbolTable.internalValue("plop");
    if (isFunction(directive)) {
        directive("not!");
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "parameter_type", "location": {"parameter": 1},
        "expected": "number", "actual": "string"
    }]);
});

Deno.test("Signed-byte parameters must be between -128 -> 127", () => {
    const directiveBody = (parameter: string): DirectiveResult => parameter;
    const systemUnderTest = testSystem({
        "plop": [directiveBody, ["signedByte", "signedByte", "signedByte"]]
    });
    const directive = systemUnderTest.symbolTable.internalValue("plop");
    if (isFunction(directive)) {
        directive(-200, 25, 255);
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "parameter_value", "location": {"parameter": 1},
        "expected": "(signed byte) (-128)-127", "actual": "-200"
    }, {
        "kind": "parameter_value", "location": {"parameter": 3},
        "expected": "(signed byte) (-128)-127", "actual": "255"
    }]);
});

Deno.test("Signed-byte parameters also check for numbers", () => {
    const directiveBody = (parameter: string): DirectiveResult => parameter;
    const systemUnderTest = testSystem({
        "plop": [directiveBody, ["signedByte"]]
    });
    const directive = systemUnderTest.symbolTable.internalValue("plop");
    if (isFunction(directive)) {
        directive("not!");
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "parameter_type", "location": {"parameter": 1},
        "expected": "number", "actual": "string"
    }]);
});

Deno.test("untyped directives will handle their own parameter validation", () => {
    const directiveBody = (
        ...parameters: Array<unknown>
    ): DirectiveResult => parameters.length;
    const systemUnderTest = testSystem({
        "plop": [directiveBody, undefined]
    });
    const directive = systemUnderTest.symbolTable.internalValue("plop");
    if (isFunction(directive)) {
        expect(directive(1, "two", 3)).toBe(3);
        expect(systemUnderTest.currentLine().failures()).toEqual([]);
        expect(directive(false)).toBe(1);
        expect(systemUnderTest.currentLine().failures()).toEqual([]);
        expect(directive("w", "x", "y", "z")).toBe(4);
        expect(systemUnderTest.currentLine().failures()).toEqual([]);
    }
});
