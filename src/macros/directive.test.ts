import type { FunctionUseDirective } from "../directives/bags.ts";
import type { AssertionFailure, Failure } from "../failure/bags.ts";
import type { MacroName } from "./data-types.ts";

import { expect } from "jsr:@std/expect";
import { mockNextPass } from "../assembler/testing.ts";
import { directiveFunction } from "../directives/directive-function.ts";
import { macroPipeline } from "./assembly-pipeline.ts";
import { systemUnderTest } from "./testing.ts";

const testDirectives = (system: ReturnType<typeof systemUnderTest>) => {
    const $macroPipeline = macroPipeline(system.macros);

    const macro = directiveFunction("macro", $macroPipeline.macroDirective);

    const end = directiveFunction("end", $macroPipeline.endDirective);

    const use = (macroName: MacroName) => {
        const fromTable = system.symbolTable.use(macroName);
        expect(fromTable.type).toBe("functionUseDirective");
        return directiveFunction(
            macroName, fromTable as FunctionUseDirective
        );
    };

    return {
        "macro": macro,
        "end": end,
        "use": use
    }
};

Deno.test("The macro doesn't have to have parameters", () => {
    const system = systemUnderTest();
    const directives = testDirectives(system);

    const define = directives.macro("testMacro");
    expect(define.type).not.toBe("failures");
});


Deno.test("The macro directive name must be a string", () => {
    const system = systemUnderTest();
    const directives = testDirectives(system);

    const result = directives.macro(47);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as AssertionFailure;
    expect(failure.kind).toBe("type_failure");
    expect(failure.location).toEqual({"parameter": 0});
    expect(failure.expected).toBe("string");
    expect(failure.actual).toEqual("number");
});

Deno.test("The parameters in a definition must be strings", () => {
    const system = systemUnderTest();
    const directives = testDirectives(system);

    const result = directives.macro("testMacro", "a", 2, "b", 3);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(2);
    {
        const failure = failures[0] as AssertionFailure;
        expect(failure.kind).toBe("type_failure");
        expect(failure.location).toEqual({"parameter": 2});
        expect(failure.expected).toEqual("string");
        expect(failure.actual).toEqual("number");
    } {
        const failure = failures[1] as AssertionFailure;
        expect(failure.kind).toBe("type_failure");
        expect(failure.location).toEqual({"parameter": 4});
        expect(failure.expected).toBe("string");
        expect(failure.actual).toBe("number");
    }
});

Deno.test("On calling a macro, the parameters must be strings or numbers", () => {
    const system = systemUnderTest();
    const directives = testDirectives(system);

    const define = directives.macro("testMacro", "a", "b");
    expect(define.type).not.toBe("failures");
    const end = directives.end();
    expect(end.type).not.toBe("failures");

    const testMacro = directives.use("testMacro");
    const result = testMacro(true, {"c": "c"});
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(2);
    {
        const failure = failures[0] as AssertionFailure;
        expect(failure.kind).toBe("type_failure");
        expect(failure.location).toEqual({"parameter": 0});
        expect(failure.expected).toBe("string, number");
        expect(failure.actual).toBe("boolean");
    } {
        const failure = failures[1] as AssertionFailure;
        expect(failure.kind).toBe("type_failure");
        expect(failure.location).toEqual({"parameter": 1});
        expect(failure.expected).toBe("string, number");
        expect(failure.actual).toBe("object");
    }
});

Deno.test("Parameter count mismatches result in a failure", () => {
    const system = systemUnderTest();
    const directives = testDirectives(system);

    const define = directives.macro("testMacro", "a", "b", "C");
    expect(define.type).not.toBe("failures");
    const end = directives.end();
    expect(end.type).not.toBe("failures");

    const testMacro = directives.use("testMacro");
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
    const directives = testDirectives(system);
    {
        const define = directives.macro("testMacro");
        expect(define.type).not.toBe("failures");
        const end = directives.end();
        expect(end.type).not.toBe("failures");

        const testMacro = directives.use("testMacro");
        const use = testMacro();
        expect(use.type).not.toBe("failures");
    }
    const pipeline = system.symbolTable.assemblyPipeline(mockNextPass());
    [...pipeline];
    {
        const inUse = system.symbolTable.alreadyInUse("testMacro");
        expect(inUse.type).not.toBe("failures");
        const define = directives.macro("testMacro");
        expect(define.type).not.toBe("failures");
        const end = directives.end();
        expect(end.type).not.toBe("failures");

        const testMacro = directives.use("testMacro");
        const result = testMacro();
        expect(result.type).not.toBe("failures");
    }
});
