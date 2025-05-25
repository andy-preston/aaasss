import type { AssertionFailure, Failure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { systemUnderTest } from "./testing.ts";
import { dummyLine } from "../line/line-types.ts";

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

    const use = system.macros.use("testMacro", ["1", "2"]);
    expect(use.type).toBe("failures");
    const failures = use.it as Array<Failure>;
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

        const use = system.macros.use("testMacro", []);
        expect(use.type).not.toBe("failures");
    }
    system.symbolTable.reset(dummyLine(true).withPass(1));
    {
        const inUse = system.symbolTable.alreadyInUse("testMacro");
        expect(inUse.type).not.toBe("failures");
        const define = system.macros.define("testMacro", []);
        expect(define.type).not.toBe("failures");
        const end = system.macros.end();
        expect(end.type).not.toBe("failures");

        const use = system.macros.use("testMacro", []);
        expect(use.type).not.toBe("failures");
    }
});
