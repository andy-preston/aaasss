import type { AssertionFailure, Failure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { dummyLine } from "../line/line-types.ts";
import { testSystem } from "./testing.ts";

Deno.test("The macro doesn't have to have parameters", () => {
    const systemUnderTest = testSystem();
    const define = systemUnderTest.macros.define("testMacro", []);
    expect(define.type).not.toBe("failures");
});

Deno.test("Parameter count mismatches result in a failure", () => {
    const systemUnderTest = testSystem();

    const define = systemUnderTest.macros.define("testMacro", ["a", "b", "C"]);
    expect(define.type).not.toBe("failures");
    const end = systemUnderTest.macros.end();
    expect(end.type).not.toBe("failures");

    const use = systemUnderTest.macros.use("testMacro", ["1", "2"]);
    expect(use.type).toBe("failures");
    const failures = use.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as AssertionFailure;
    expect(failure.kind).toBe("macro_params");
    expect(failure.expected).toBe("3");
    expect(failure.actual).toBe("2");
});

Deno.test("A macro can be defined in both passes", () => {
    const systemUnderTest = testSystem();
    {
        const define = systemUnderTest.macros.define("testMacro", []);
        expect(define.type).not.toBe("failures");
        const end = systemUnderTest.macros.end();
        expect(end.type).not.toBe("failures");

        const use = systemUnderTest.macros.use("testMacro", []);
        expect(use.type).not.toBe("failures");
    }
    systemUnderTest.symbolTable.reset(dummyLine(true, 1));
    {
        const inUse = systemUnderTest.symbolTable.alreadyInUse("testMacro");
        expect(inUse.type).not.toBe("failures");
        const define = systemUnderTest.macros.define("testMacro", []);
        expect(define.type).not.toBe("failures");
        const end = systemUnderTest.macros.end();
        expect(end.type).not.toBe("failures");

        const use = systemUnderTest.macros.use("testMacro", []);
        expect(use.type).not.toBe("failures");
    }
});
