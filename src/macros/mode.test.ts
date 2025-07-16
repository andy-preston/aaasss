import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("the last line has a failure is a definition wasn't closed", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");
    systemUnderTest.macros.define("plop", []);
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    systemUnderTest.macros.reset(1);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "macro_noEnd", "location": undefined
    }]);
});

Deno.test("You can't define a macro whilst still in definition mode", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");
    systemUnderTest.macros.define("aMacro", []);
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    systemUnderTest.macros.define("anotherOne", []);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "macro_multiDefine", "location": undefined,
        "clue": "aMacro"
    }]);
});

Deno.test("Multiple macros can be defined", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");
    for (const macroName of ["aMacro", "anotherOne", "yetAnotherOne"]) {
        systemUnderTest.macros.define(macroName, []);
        expect(systemUnderTest.currentLine().failures).toEqual([]);
        systemUnderTest.macros.end();
        expect(systemUnderTest.currentLine().failures).toEqual([]);
    };
});

Deno.test("You can't end a macro definition if one isn't being defined", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");
    systemUnderTest.macros.end();
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "macro_end", "location": undefined
    }]);
});

Deno.test("Whilst a macro is being defined, isDefiningMacro is set", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");
    systemUnderTest.macros.define("testMacro", []);
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    systemUnderTest.macros.taggedLine();
    expect(systemUnderTest.currentLine().isDefiningMacro).toBe(true);
    systemUnderTest.macros.end();
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    systemUnderTest.macros.taggedLine();
    expect(systemUnderTest.currentLine().isDefiningMacro).toBe(false);
});
