import type { Failure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { mockLastLine } from "../assembler/testing.ts";
import { directiveFunction } from "../directives/directive-function.ts";
import { systemUnderTest } from "./testing.ts";

const irrelevantName = "testing";

Deno.test("the last line has a failure is a definition wasn't closed", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const unfinishedDefinition = macro("plop");
    expect(unfinishedDefinition.type).not.toBe("failures");

    const pipeline = system.macros.assemblyPipeline(mockLastLine());
    const lastLine = pipeline.next().value!;
    expect(lastLine.failed).toBeTruthy();
    const failures = [...lastLine.failures()];
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("macro_noEnd");
});

Deno.test("You can't define a macro whilst still in definition mode", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    expect(macro("aMacro").type).not.toBe("failures");
    const result = macro("anotherOne");
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("macro_multiDefine");
});

Deno.test("Multiple macros can be defined", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const end = directiveFunction(
        irrelevantName, system.macros.endDirective
    );
    for (const macroName of ["aMacro", "anotherOne", "yetAnotherOne"]) {
        expect(macro(macroName).type).not.toBe("failures");
        expect(end().type).not.toBe("failures");
    };
});

Deno.test("You can't end a macro definition if one isn't being defined", () => {
    const system = systemUnderTest();
    const end = directiveFunction(
        irrelevantName, system.macros.endDirective
    );
    const result = end();
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("macro_end");
});
