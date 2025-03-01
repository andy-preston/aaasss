import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("leftInIllegalState returns a failure is a definition wasn't closed", () => {
    const system = systemUnderTest();
    system.macros.macroDirective.method("plop", []);
    const result = system.macros.leftInIllegalState();
    assertFailure(result, "macro_noEnd");
});

Deno.test("You can't define a macro whilst still in definition mode", () => {
    const system = systemUnderTest();
    assertSuccess(
        system.macros.macroDirective.method("aMacro", []),
        undefined
    );
    assertFailure(
        system.macros.macroDirective.method("anotherOne", []),
        "macro_multiDefine"
    );
});

Deno.test("Multiple macros can be defined", () => {
    const system = systemUnderTest();

    assertSuccess(system.macros.macroDirective.method("aMacro", []), undefined);
    assertSuccess(system.macros.endDirective.method(), undefined);

    assertSuccess(system.macros.macroDirective.method("anotherOne", []), undefined);
    assertSuccess(system.macros.endDirective.method(), undefined);
});

Deno.test("You can't end a macro definition if one isn't being defined", () => {
    const system = systemUnderTest();
    const ending = system.macros.endDirective.method();
    assertFailure(ending, "macro_end");
});
