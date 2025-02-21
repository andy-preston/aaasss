import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("leftInIllegalState returns a failure is a definition wasn't closed", () => {
    const system = systemUnderTest();
    system.macros.macro("plop");
    const result = system.macros.leftInIllegalState();
    assertFailure(result, "macro_noEnd");
});

Deno.test("You can't define a macro whilst still in definition mode", () => {
    const system = systemUnderTest();
    const firstDefinition = system.macros.macro("aMacro");
    assertSuccess(firstDefinition, undefined);
    const secondDefinition = system.macros.macro("anotherOne");
    assertFailure(secondDefinition, "macro_multiDefine");
});

Deno.test("Multiple macros can be defined", () => {
    const system = systemUnderTest();

    assertSuccess(system.macros.macro("aMacro"), undefined);
    assertSuccess(system.macros.end(), undefined);

    assertSuccess(system.macros.macro("anotherOne"), undefined);
    assertSuccess(system.macros.end(), undefined);
});

Deno.test("You can't end a macro definition if one isn't being defined", () => {
    const system = systemUnderTest();
    const ending = system.macros.end();
    assertFailure(ending, "macro_end");
});
