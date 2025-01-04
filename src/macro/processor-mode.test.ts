import { assertEquals } from "assert/equals";
import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { processor } from "./processor.ts";
import { testLine } from "./testing.ts";

Deno.test("leftInIllegalState returns a failure is a definition wasn't closed", () => {
    const macroProcessor = processor();
    macroProcessor.define("plop");
    const result = macroProcessor.leftInIllegalState();
    assertEquals(result.length, 1);
    assertEquals(result[0]!.kind, "macro_define");
});

Deno.test("You can't define a macro whilst still in definition mode", () => {
    const macroProcessor = processor();
    const firstDefinition = macroProcessor.define("aMacro");
    assertSuccess(firstDefinition, "aMacro");
    const secondDefinition = macroProcessor.define("anotherOne");
    assertFailure(secondDefinition, "macro_define");
});

Deno.test("You can't end a definition without any lines in the macro", () => {
    const macroProcessor = processor();
    const definition = macroProcessor.define("aMacro");
    assertSuccess(definition, "aMacro");
    const ending = macroProcessor.end();
    assertFailure(ending, "macro_empty");
});

Deno.test("Multiple macros can be defined", () => {
    const macroProcessor = processor();

    const firstDefinition = macroProcessor.define("aMacro");
    assertSuccess(firstDefinition, "aMacro");
    macroProcessor.lines(testLine("", "TST", [])).toArray();
    const firstEnding = macroProcessor.end();
    assertSuccess(firstEnding, "aMacro");

    const secondDefinition = macroProcessor.define("anotherOne");
    assertSuccess(secondDefinition, "anotherOne");
    macroProcessor.end();
});

Deno.test("You can't end a macro definition if one isn't being defined", () => {
    const macroProcessor = processor();
    const ending = macroProcessor.end();
    assertFailure(ending, "macro_end");
});
