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
        system.macros.macroDirective.body("aMacro", []), ""
    );
    assertFailure(
        system.macros.macroDirective.body("anotherOne", []),
        "macro_multiDefine"
    );
});

Deno.test("Multiple macros can be defined", () => {
    const system = systemUnderTest();

    assertSuccess(
        system.macros.macroDirective.body("aMacro", []), ""
    );
    assertSuccess(
        system.macros.endDirective.body(), ""
    );

    assertSuccess(
        system.macros.macroDirective.body("anotherOne", []), ""
    );
    assertSuccess(
        system.macros.endDirective.body(), ""
    );
});

Deno.test("You can't end a macro definition if one isn't being defined", () => {
    const system = systemUnderTest();
    assertFailure(system.macros.endDirective.body(), "macro_end");
});
