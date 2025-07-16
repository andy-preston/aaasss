import { expect } from "jsr:@std/expect";
import { isFunction } from "../directives/testing.ts";
import { testSystem } from "./testing.ts";

Deno.test("The macro doesn't have to have parameters", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");
    const macro = systemUnderTest.symbolTable.use("macro");
    const end = systemUnderTest.symbolTable.use("end");
    if (isFunction(macro)) {
        macro("testMacro");
    }
    if (isFunction(end)) {
        end();
    }
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(
        typeof systemUnderTest.symbolTable.use("testMacro")
    ).toBe("function");
});

Deno.test("Parameter count mismatches result in a failure", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");
    const macro = systemUnderTest.symbolTable.use("macro");
    const end = systemUnderTest.symbolTable.use("end");

    if (isFunction(macro)) {
        macro("testMacro", "a", "b", "c");
    }
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    if (isFunction(end)) {
        end();
    }
    expect(systemUnderTest.currentLine().failures).toEqual([]);

    const testMacro = systemUnderTest.symbolTable.use("testMacro");
    if (isFunction(testMacro)) {
        testMacro("1", "2");
    }
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "macro_params", "location": undefined,
        "expected": "3", "actual": "2"
    }]);
});

Deno.test("A macro can be defined in both passes", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");
    const macro = systemUnderTest.symbolTable.use("macro");
    const end = systemUnderTest.symbolTable.use("end");

    if (isFunction(macro)) {
        macro("testMacro");
    }
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    if (isFunction(end)) {
        end();
    }
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    {
        const testMacro = systemUnderTest.symbolTable.use("testMacro");
        if (isFunction(testMacro)) {
            testMacro();
        }
    }
    expect(systemUnderTest.currentLine().failures).toEqual([]);

    expect (
        systemUnderTest.symbolTable.alreadyInUse("testMacro")
    ).toBe(true);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "symbol_alreadyExists", "location": undefined,
        "name": "testMacro", "definition": "plop.asm:0"
    }]);
    systemUnderTest.currentLine().failures = [];

    systemUnderTest.symbolTable.reset(1);
    expect (
        systemUnderTest.symbolTable.alreadyInUse("testMacro")
    ).toBe(false);
    expect(systemUnderTest.currentLine().failures).toEqual([]);

    if (isFunction(macro)) {
        macro("testMacro");
    }
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    if (isFunction(end)) {
        end();
    }
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    {
        const testMacro = systemUnderTest.symbolTable.use("testMacro");
        if (isFunction(testMacro)) {
            testMacro();
        }
    }
    expect(systemUnderTest.currentLine().failures).toEqual([]);
});
