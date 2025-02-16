import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { testEnvironment } from "./testing.ts";

Deno.test("leftInIllegalState returns a failure is a definition wasn't closed", () => {
    const environment = testEnvironment();
    environment.macros.macro("plop");
    const result = environment.macros.leftInIllegalState();
    assertFailure(result, "macro_noEnd");
});

Deno.test("You can't define a macro whilst still in definition mode", () => {
    const environment = testEnvironment();
    const firstDefinition = environment.macros.macro("aMacro");
    assertSuccess(firstDefinition, undefined);
    const secondDefinition = environment.macros.macro("anotherOne");
    assertFailure(secondDefinition, "macro_multiDefine");
});

Deno.test("Multiple macros can be defined", () => {
    const environment = testEnvironment();

    assertSuccess(environment.macros.macro("aMacro"), undefined);
    assertSuccess(environment.macros.end(), undefined);

    assertSuccess(environment.macros.macro("anotherOne"), undefined);
    assertSuccess(environment.macros.end(), undefined);
});

Deno.test("You can't end a macro definition if one isn't being defined", () => {
    const environment = testEnvironment();
    const ending = environment.macros.end();
    assertFailure(ending, "macro_end");
});
