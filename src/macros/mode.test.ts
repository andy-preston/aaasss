import type { Failure } from "../failure/bags.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";

import { expect } from "jsr:@std/expect";
import { line } from "../line/line-types.ts";
import { systemUnderTest } from "./testing.ts";

const isLastLineOfPass = true;

Deno.test("the last line has a failure is a definition wasn't closed", () => {
    const system = systemUnderTest();

    const define = system.macros.define("plop", []);
    expect(define.type).not.toBe("failures");
    const lastLine = system.macros.processedLine(
        line("", 0, "", "", 0, isLastLineOfPass) as LineWithTokens
    );
    expect(lastLine.failed).toBeTruthy();
    const failures = [...lastLine.failures()];
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("macro_noEnd");
});

Deno.test("You can't define a macro whilst still in definition mode", () => {
    const system = systemUnderTest();
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
    const system = systemUnderTest();

    for (const macroName of ["aMacro", "anotherOne", "yetAnotherOne"]) {
        const define = system.macros.define(macroName, []);
        expect(define.type).not.toBe("failures");
        const end = system.macros.end();
        expect(end.type).not.toBe("failures");
    };
});

Deno.test("You can't end a macro definition if one isn't being defined", () => {
    const system = systemUnderTest();

    const end = system.macros.end();
    expect(end.type).toBe("failures");
    const failures = end.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("macro_end");
});
