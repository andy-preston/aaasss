import type { Failure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { dummyLine } from "../line/line-types.ts";
import { testSystem } from "./testing.ts";

Deno.test("the last line has a failure is a definition wasn't closed", () => {
    const systemUnderTest = testSystem();
    const define = systemUnderTest.macros.define("plop", []);
    expect(define.type).not.toBe("failures");

    const line = dummyLine(true, 1);
    systemUnderTest.macros.processedLine(line);
    expect(line.failed()).toBe(true);
    expect(line.failures.length).toBe(1);
    const failure = line.failures[0]!;
    expect(failure.kind).toBe("macro_noEnd");
});

Deno.test("You can't define a macro whilst still in definition mode", () => {
    const systemUnderTest = testSystem();
    {
        const define = systemUnderTest.macros.define("aMacro", []);
        expect(define.type).not.toBe("failures");
    } {
        const define = systemUnderTest.macros.define("anotherOne", []);
        expect(define.type).toBe("failures");
        const failures = define.it as Array<Failure>;
        expect(failures.length).toBe(1);
        const failure = failures[0]!;
        expect(failure.kind).toBe("macro_multiDefine");
    }
});

Deno.test("Multiple macros can be defined", () => {
    const systemUnderTest = testSystem();
    for (const macroName of ["aMacro", "anotherOne", "yetAnotherOne"]) {
        const define = systemUnderTest.macros.define(macroName, []);
        expect(define.type).not.toBe("failures");
        const end = systemUnderTest.macros.end();
        expect(end.type).not.toBe("failures");
    };
});

Deno.test("You can't end a macro definition if one isn't being defined", () => {
    const systemUnderTest = testSystem();
    const end = systemUnderTest.macros.end();
    expect(end.type).toBe("failures");
    const failures = end.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("macro_end");
});

Deno.test("Whilst defining, a flag is set on the line", () => {
    const systemUnderTest = testSystem();
    const define = systemUnderTest.macros.define("plop", []);
    expect(define.type).not.toBe("failures");
    systemUnderTest.macros.processedLine(systemUnderTest.line);
    expect(systemUnderTest.line.isDefiningMacro).toBe(true);
});
