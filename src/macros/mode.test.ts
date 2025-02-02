import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { testEnvironment, testLine } from "./testing.ts";

Deno.test("leftInIllegalState returns a failure is a definition wasn't closed", () => {
    const environment = testEnvironment();
    environment.macros.macro("plop");
    const result = environment.macros.leftInIllegalState();
    assertFailure(result, "macro_define");
});

Deno.test("You can't define a macro whilst still in definition mode", () => {
    const environment = testEnvironment();
    const firstDefinition = environment.macros.macro("aMacro");
    assertSuccess(firstDefinition, undefined);
    const secondDefinition = environment.macros.macro("anotherOne");
    assertFailure(secondDefinition, "macro_define");
});

Deno.test("You can't end a definition without any lines in the macro", () => {
    const environment = testEnvironment();
    const definition = environment.macros.macro("aMacro");
    assertSuccess(definition, undefined);
    const ending = environment.macros.end();
    assertFailure(ending, "macro_empty");
});

Deno.test("Multiple macros can be defined", () => {
    const environment = testEnvironment();

    const firstDefinition = environment.macros.macro("aMacro");
    assertSuccess(firstDefinition, undefined);
    environment.macros.lines(testLine("", "TST", [])).toArray();
    const firstEnding = environment.macros.end();
    assertSuccess(firstEnding, undefined);
    environment.macros.lines(testLine("", "", [])).toArray();

    const secondDefinition = environment.macros.macro("anotherOne");
    assertSuccess(secondDefinition, undefined);
    environment.macros.end();
});

Deno.test("You can't end a macro definition if one isn't being defined", () => {
    const environment = testEnvironment();
    const ending = environment.macros.end();
    assertFailure(ending, "macro_end");
});
