import type { AssertionFailure, Failure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { systemUnderTest, testLines } from "./testing.ts";

Deno.test("If a macro has parameters, they are substituted", () => {
    const system = systemUnderTest();

    const define = system.macros.define("testMacro", ["a", "b"]);
    expect(define.type).not.toBe("failures");
    const end = system.macros.end();
    expect(end.type).not.toBe("failures");

    const mockDirectiveUse = system.symbolTable.use("testMacro");
    expect(mockDirectiveUse.type).toBe("functionUseDirective");

    const use = system.macros.use("testMacro", ["1", "2"]);
    expect(use.type).not.toBe("failures");

    const firstExecution = 1;
    const pipeline = system.macros.assemblyPipeline(testLines([{
        "macroName": "testMacro", "macroCount": firstExecution,
        "label": "", "mnemonic": "TST", "symbolicOperands": ["a", "b"]
    }]));
    const result = pipeline.next().value!;
    expect(result.failed()).toBeFalsy();
    expect(result.mnemonic).toBe("TST");
    expect(result.symbolicOperands).toEqual(["1", "2"]);
});

Deno.test("Parameter count mismatches result in a failure", () => {
    const system = systemUnderTest();

    const define = system.macros.define("testMacro", ["a", "b", "C"]);
    expect(define.type).not.toBe("failures");
    const end = system.macros.end();
    expect(end.type).not.toBe("failures");

    const result = system.macros.use("testMacro", ["1", "2"]);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as AssertionFailure;
    expect(failure.kind).toBe("macro_params");
    expect(failure.expected).toBe("3");
    expect(failure.actual).toBe("2");
});
