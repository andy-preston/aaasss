import type { AssertionFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("The macro doesn't have to have parameters", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");
    systemUnderTest.macros.define("testMacro", []);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
});

Deno.test("Parameter count mismatches result in a failure", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");

    systemUnderTest.macros.define("testMacro", ["a", "b", "C"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    systemUnderTest.macros.end();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);

    systemUnderTest.macros.use("testMacro", ["1", "2"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as AssertionFailure;
    expect(failure.kind).toBe("macro_params");
    expect(failure.expected).toBe("3");
    expect(failure.actual).toBe("2");
});

Deno.test("A macro can be defined in both passes", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");
    systemUnderTest.macros.define("testMacro", []);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    systemUnderTest.macros.end();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);

    systemUnderTest.macros.use("testMacro", []);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    systemUnderTest.symbolTable.reset(1);
    systemUnderTest.symbolTable.alreadyInUse("testMacro");
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    systemUnderTest.macros.define("testMacro", []);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    systemUnderTest.macros.end();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    systemUnderTest.macros.use("testMacro", []);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
});
