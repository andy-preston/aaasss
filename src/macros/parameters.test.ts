import type { AssertionFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";
import { BaggedDirective } from "../directives/bags.ts";

Deno.test("If a macro has parameters, they are substituted", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");

    systemUnderTest.macros.define("testMacro", ["a", "b"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    systemUnderTest.macros.end();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    const forceSymbolIncrement = systemUnderTest.symbolTable.use("testMacro");
    expect((forceSymbolIncrement as BaggedDirective).type).toBe(
        "functionUseDirective"
    );
    systemUnderTest.macros.use("testMacro", ["1", "2"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);

    systemUnderTest.currentLine().macroName = "testMacro";
    systemUnderTest.currentLine().macroCount = 1;
    systemUnderTest.currentLine().operands = ["a", "b"];
    systemUnderTest.macros.processedLine();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.currentLine().operands).toEqual(["1", "2"]);
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
