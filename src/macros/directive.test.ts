import type { FunctionUseDirective } from "../directives/bags.ts";
import type { AssertionFailure, Failure } from "../failure/bags.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { MacroName } from "./data-types.ts";

import { expect } from "jsr:@std/expect";
import { directiveFunction } from "../directives/directive-function.ts";
import { systemUnderTest } from "./testing.ts";
import { dummyLine } from "../line/line-types.ts";

const useMacroDirective = (symbolTable: SymbolTable, macroName: MacroName) => {
    const fromTable = symbolTable.use(macroName);
    expect(fromTable.type).toBe("functionUseDirective");
    return directiveFunction(macroName, fromTable as FunctionUseDirective);
};

Deno.test("The macro doesn't have to have parameters", () => {
    const system = systemUnderTest();
    const define = system.macros.define("testMacro", []);
    expect(define.type).not.toBe("failures");
});

Deno.test("Parameter count mismatches result in a failure", () => {
    const system = systemUnderTest();
    const define = system.macros.define("testMacro", ["a", "b", "C"]);
    expect(define.type).not.toBe("failures");
    const end = system.macros.end();
    expect(end.type).not.toBe("failures");

    const testMacro = useMacroDirective(system.symbolTable, "testMacro");
    const result = testMacro("1", "2");
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as AssertionFailure;
    expect(failure.kind).toBe("macro_params");
    expect(failure.expected).toBe("3");
    expect(failure.actual).toBe("2");
});

Deno.test("A macro can be defined in both passes", () => {
    const system = systemUnderTest();
    {
        const define = system.macros.define("testMacro", []);
        expect(define.type).not.toBe("failures");
        const end = system.macros.end();
        expect(end.type).not.toBe("failures");

        const testMacro = useMacroDirective(system.symbolTable, "testMacro");
        const use = testMacro();
        expect(use.type).not.toBe("failures");
    }
    system.macros.processedLine(dummyLine(true));
    {
        const inUse = system.symbolTable.alreadyInUse("testMacro");
        expect(inUse.type).not.toBe("failures");
        const define = system.macros.define("testMacro", []);
        expect(define.type).not.toBe("failures");
        const end = system.macros.end();
        expect(end.type).not.toBe("failures");

        const testMacro = useMacroDirective(system.symbolTable, "testMacro");
        const result = testMacro();
        expect(result.type).not.toBe("failures");
    }
});
