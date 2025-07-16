import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";
import { isFunction } from "../directives/testing.ts";

Deno.test("If a macro has parameters, they are substituted", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");
    const macro = systemUnderTest.symbolTable.use("macro");
    const end = systemUnderTest.symbolTable.use("end");

    if (isFunction(macro)) {
        macro("testMacro", "a", "b");
    }
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    if (isFunction(end)) {
        end();
    }
    const testMacro = systemUnderTest.symbolTable.use("testMacro");
    if (isFunction(testMacro)) {
        testMacro("1", "2");
    }
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    systemUnderTest.currentLine().macroName = "testMacro";
    systemUnderTest.currentLine().macroCount = 1;
    systemUnderTest.currentLine().operands = ["a", "b"];
    systemUnderTest.macros.processedLine();
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(systemUnderTest.currentLine().operands).toEqual(["1", "2"]);
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
