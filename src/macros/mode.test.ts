import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("leftInIllegalState returns a failure is a definition wasn't closed", () => {
    const system = systemUnderTest();
    system.macros.macroDirective.body("plop", []);
    const result = system.macros.leftInIllegalState();
    assertFailure(result, "macro_noEnd");
});

Deno.test("You can't define a macro whilst still in definition mode", () => {
    const system = systemUnderTest();
    assertSuccess(
        system.macros.macroDirective.body("aMacro", []),
        undefined
    );
    assertFailure(
        system.macros.macroDirective.body("anotherOne", []),
        "macro_multiDefine"
    );
});

Deno.test("Multiple macros can be defined", () => {
    const system = systemUnderTest();

    assertSuccess(
        system.macros.macroDirective.body("aMacro", []),
        undefined
    );
    assertSuccess(
        system.macros.endDirective.body(),
        undefined
    );

    assertSuccess(
        system.macros.macroDirective.body("anotherOne", []),
        undefined
    );
    assertSuccess(
        system.macros.endDirective.body(),
        undefined
    );
});

Deno.test("You can't end a macro definition if one isn't being defined", () => {
    const system = systemUnderTest();
    assertFailure(system.macros.endDirective.body(), "macro_end");
});
