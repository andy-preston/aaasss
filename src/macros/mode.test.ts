import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { macros } from "./macros.ts";
import { testLine } from "./testing.ts";

Deno.test("leftInIllegalState returns a failure is a definition wasn't closed", () => {
    const macroProcessor = macros();
    macroProcessor.macro("plop");
    const result = macroProcessor.leftInIllegalState();
    assertFailure(result, "macro_define");
});

Deno.test("You can't define a macro whilst still in definition mode", () => {
    const macroProcessor = macros();
    const firstDefinition = macroProcessor.macro("aMacro");
    assertSuccess(firstDefinition, undefined);
    const secondDefinition = macroProcessor.macro("anotherOne");
    assertFailure(secondDefinition, "macro_define");
});

Deno.test("You can't end a definition without any lines in the macro", () => {
    const macroProcessor = macros();
    const definition = macroProcessor.macro("aMacro");
    assertSuccess(definition, undefined);
    const ending = macroProcessor.end();
    assertFailure(ending, "macro_empty");
});

Deno.test("Multiple macros can be defined", () => {
    const macroProcessor = macros();

    const firstDefinition = macroProcessor.macro("aMacro");
    assertSuccess(firstDefinition, undefined);
    macroProcessor.lines(testLine("", "TST", [])).toArray();
    const firstEnding = macroProcessor.end();
    assertSuccess(firstEnding, undefined);

    const secondDefinition = macroProcessor.macro("anotherOne");
    assertSuccess(secondDefinition, undefined);
    macroProcessor.end();
});

Deno.test("You can't end a macro definition if one isn't being defined", () => {
    const macroProcessor = macros();
    const ending = macroProcessor.end();
    assertFailure(ending, "macro_end");
});
