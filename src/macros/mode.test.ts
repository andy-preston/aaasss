import type { Failure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { dummyLine } from "../line/line-types.ts";
import { testSystem } from "./testing.ts";

Deno.test("the last line has a failure is a definition wasn't closed", () => {
    const system = testSystem();
    const define = system.macros.define("plop", []);
    expect(define.type).not.toBe("failures");

    const line = dummyLine(true, 1);
    system.macros.processedLine(line);
    expect(line.failed()).toBe(true);
    expect(line.failures.length).toBe(1);
    const failure = line.failures[0]!;
    expect(failure.kind).toBe("macro_noEnd");
});

Deno.test("You can't define a macro whilst still in definition mode", () => {
    const system = testSystem();
    {
        const define = system.macros.define("aMacro", []);
        expect(define.type).not.toBe("failures");
    } {
        const define = system.macros.define("anotherOne", []);
        expect(define.type).toBe("failures");
        const failures = define.it as Array<Failure>;
        expect(failures.length).toBe(1);
        const failure = failures[0]!;
        expect(failure.kind).toBe("macro_multiDefine");
    }
});

Deno.test("Multiple macros can be defined", () => {
    const system = testSystem();
    for (const macroName of ["aMacro", "anotherOne", "yetAnotherOne"]) {
        const define = system.macros.define(macroName, []);
        expect(define.type).not.toBe("failures");
        const end = system.macros.end();
        expect(end.type).not.toBe("failures");
    };
});

Deno.test("You can't end a macro definition if one isn't being defined", () => {
    const system = testSystem();
    const end = system.macros.end();
    expect(end.type).toBe("failures");
    const failures = end.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("macro_end");
});

Deno.test("Whilst defining, a flag is set on the line", () => {
    const system = testSystem();
    const define = system.macros.define("plop", []);
    expect(define.type).not.toBe("failures");
    system.macros.processedLine(system.line);
    expect(system.line.isDefiningMacro).toBe(true);
});
