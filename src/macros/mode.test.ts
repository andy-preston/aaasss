import type { BoringFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("the last line has a failure is a definition wasn't closed", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");
    systemUnderTest.macros.define("plop", []);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    systemUnderTest.macros.reset(1);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as BoringFailure;
    expect(failure.kind).toBe("macro_noEnd");
});

Deno.test("You can't define a macro whilst still in definition mode", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");
    systemUnderTest.macros.define("aMacro", []);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    systemUnderTest.macros.define("anotherOne", []);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as BoringFailure;
    expect(failure.kind).toBe("macro_multiDefine");
});

Deno.test("Multiple macros can be defined", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");
    for (const macroName of ["aMacro", "anotherOne", "yetAnotherOne"]) {
        systemUnderTest.macros.define(macroName, []);
        expect(systemUnderTest.currentLine().failures.length).toBe(0);
        systemUnderTest.macros.end();
        expect(systemUnderTest.currentLine().failures.length).toBe(0);
    };
});

Deno.test("You can't end a macro definition if one isn't being defined", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");
    systemUnderTest.macros.end();
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as BoringFailure;
    expect(failure.kind).toBe("macro_end");
});

Deno.test("Whilst a macro is being defined, isDefiningMacro is set", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");
    systemUnderTest.macros.define("testMacro", []);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    systemUnderTest.macros.taggedLine();
    expect(systemUnderTest.currentLine().isDefiningMacro).toBe(true);
    systemUnderTest.macros.end();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    systemUnderTest.macros.taggedLine();
    expect(systemUnderTest.currentLine().isDefiningMacro).toBe(false);
});
