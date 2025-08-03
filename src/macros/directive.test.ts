import { expect } from "jsr:@std/expect";
import { isFunction } from "../directives/testing.ts";
import { testSystem } from "./testing.ts";
import { failures } from "../failure/failures.ts";

Deno.test("The macro doesn't have to have parameters", () => {
    const systemUnderTest = testSystem("plop.asm");
    const macro = systemUnderTest.symbolTable.use("macro");
    const end = systemUnderTest.symbolTable.use("end");
    if (isFunction(macro)) {
        macro("testMacro");
    }
    if (isFunction(end)) {
        end();
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(
        typeof systemUnderTest.symbolTable.use("testMacro")
    ).toBe("function");
});

Deno.test("The macro directive must have at least one parameter - the macro name", () => {
    const systemUnderTest = testSystem("plop.asm");
    const macro = systemUnderTest.symbolTable.use("macro");
    if (isFunction(macro)) {
        macro();
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "parameter_count", "location": undefined,
        "expected": ">=1", "actual": "0"
    }]);
});

Deno.test("The macro directive parameters must all be strings", () => {
    const systemUnderTest = testSystem("plop.asm");
    const macro = systemUnderTest.symbolTable.use("macro");
    if (isFunction(macro)) {
        macro(1, 2, 3);
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "parameter_type", "location": {"parameter": 1},
        "expected": "string", "actual": "number"
    }, {
        "kind": "parameter_type", "location": {"parameter": 2},
        "expected": "string", "actual": "number"
    }, {
        "kind": "parameter_type", "location": {"parameter": 3},
        "expected": "string", "actual": "number"
    }]);
});

Deno.test("Parameter count mismatches result in a failure", () => {
    const systemUnderTest = testSystem("plop.asm");
    const macro = systemUnderTest.symbolTable.use("macro");
    const end = systemUnderTest.symbolTable.use("end");

    if (isFunction(macro)) {
        macro("testMacro", "a", "b", "c");
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    if (isFunction(end)) {
        end();
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([]);

    const testMacro = systemUnderTest.symbolTable.use("testMacro");
    if (isFunction(testMacro)) {
        testMacro("1", "2");
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "parameter_count", "location": undefined,
        "expected": "3", "actual": "2"
    }, {
        "kind": "parameter_type", "location": {"parameter": 3},
        "expected": "string, number: (c)", "actual": "undefined: (undefined)"
    }]);
});

Deno.test("Any macro parameters are inserted in the symbol table", () => {
    const systemUnderTest = testSystem("plop.asm");
    const macro = systemUnderTest.symbolTable.use("macro");
    const end = systemUnderTest.symbolTable.use("end");
    if (isFunction(macro)) {
        macro("testMacro", "a", "b");
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    if (isFunction(end)) {
        end();
    }
    const testMacro = systemUnderTest.symbolTable.use("testMacro");
    if (isFunction(testMacro)) {
        testMacro("1", "2");
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(
        systemUnderTest.symbolTable.internalValue("a$testMacro$1")
    ).toBe("1");
    expect(
        systemUnderTest.symbolTable.internalValue("b$testMacro$1")
    ).toBe("2");
});

Deno.test("A Parameter has to be a number or a string", () => {
    const systemUnderTest = testSystem("plop.asm");
    const macro = systemUnderTest.symbolTable.use("macro");
    const end = systemUnderTest.symbolTable.use("end");
    if (isFunction(macro)) {
        macro("testMacro", "a", "b");
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    if (isFunction(end)) {
        end();
    }
    const testMacro = systemUnderTest.symbolTable.use("testMacro");
    if (isFunction(testMacro)) {
        testMacro([1,2,3], false);
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "parameter_type", "location": {"parameter": 1},
        "expected": "string, number: (a)", "actual": "array: (1,2,3)"
    }, {
        "kind": "parameter_type", "location": {"parameter": 2},
        "expected": "string, number: (b)", "actual": "boolean: (false)"
    }]);
});

Deno.test("A macro can be defined in both passes", () => {
    const systemUnderTest = testSystem("plop.asm");
    const macro = systemUnderTest.symbolTable.use("macro");
    const end = systemUnderTest.symbolTable.use("end");

    if (isFunction(macro)) {
        macro("testMacro");
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    if (isFunction(end)) {
        end();
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    {
        const testMacro = systemUnderTest.symbolTable.use("testMacro");
        if (isFunction(testMacro)) {
            testMacro();
        }
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([]);

    expect (
        systemUnderTest.symbolTable.failIfInUse("testMacro")
    ).toBe(true);
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "symbol_alreadyExists", "location": undefined,
        "name": "testMacro", "definition": "plop.asm:0"
    }]);
    systemUnderTest.currentLine().failures = failures();

    systemUnderTest.symbolTable.reset(1);
    expect (
        systemUnderTest.symbolTable.failIfInUse("testMacro")
    ).toBe(false);
    expect(systemUnderTest.currentLine().failures()).toEqual([]);

    if (isFunction(macro)) {
        macro("testMacro");
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    if (isFunction(end)) {
        end();
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    {
        const testMacro = systemUnderTest.symbolTable.use("testMacro");
        if (isFunction(testMacro)) {
            testMacro();
        }
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
});
