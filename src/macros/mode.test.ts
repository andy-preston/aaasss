import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("leftInIllegalState returns a failure is a definition wasn't closed", () => {
    const system = systemUnderTest();
    system.macros.macroDirective("plop", []);
    const result = system.macros.leftInIllegalState();
    assertFailure(result, "macro_noEnd");
});

Deno.test("You can't define a macro whilst still in definition mode", () => {
    const system = systemUnderTest();
    const firstDefinition = system.macros.macroDirective("aMacro", []);
    assertSuccess(firstDefinition, undefined);
    const secondDefinition = system.macros.macroDirective("anotherOne", []);
    assertFailure(secondDefinition, "macro_multiDefine");
});

Deno.test("Multiple macros can be defined", () => {
    const system = systemUnderTest();

    assertSuccess(system.macros.macroDirective("aMacro", []), undefined);
    assertSuccess(system.macros.endDirective(), undefined);

    assertSuccess(system.macros.macroDirective("anotherOne", []), undefined);
    assertSuccess(system.macros.endDirective(), undefined);
});

Deno.test("You can't end a macro definition if one isn't being defined", () => {
    const system = systemUnderTest();
    const ending = system.macros.endDirective();
    assertFailure(ending, "macro_end");
});
