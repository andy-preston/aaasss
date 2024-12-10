import { assertEquals } from "assert/equals";
import { processor } from "./processor.ts";
import { assertFailure, assertSuccess } from "../coupling/value-failure-testing.ts";
import { tokenisedLine } from "../tokenise/tokenised-line.ts";
import { assemblyLine, rawLine } from "../source-code/line-types.ts";

const testLine = () => {
    const raw = rawLine("", 0, "", []);
    const assembly = assemblyLine(raw, "", []);
    return tokenisedLine(assembly, "", "TST", [], []);
};

Deno.test("leftInIllegalState returns a failure is a definition wasn't closed", () => {
    const macroProcessor = processor();
    macroProcessor.defineDirective("plop");
    const result = macroProcessor.leftInIllegalState();
    assertEquals(result.length, 1);
    assertEquals(result[0]!.kind, "macro.define");
});

Deno.test("You can't define a macro whilst still in definition mode", () => {
    const macroProcessor = processor();
    const firstDefinition = macroProcessor.defineDirective("aMacro");
    assertSuccess(firstDefinition, "aMacro");
    const secondDefinition = macroProcessor.defineDirective("anotherOne");
    assertFailure(secondDefinition, "macro.define");
});

Deno.test("You can't end a definition without any lines in the macro", () => {
    const macroProcessor = processor();
    const definition = macroProcessor.defineDirective("aMacro");
    assertSuccess(definition, "aMacro");
    const ending = macroProcessor.endDirective();
    assertFailure(ending, "macro.empty");
});

Deno.test("Multiple macros can be defined", () => {
    const macroProcessor = processor();

    const firstDefinition = macroProcessor.defineDirective("aMacro");
    assertSuccess(firstDefinition, "aMacro");
    macroProcessor.lines(testLine()).toArray();
    const firstEnding = macroProcessor.endDirective();
    assertSuccess(firstEnding, "aMacro");

    const secondDefinition = macroProcessor.defineDirective("anotherOne");
    assertSuccess(secondDefinition, "anotherOne");
    macroProcessor.endDirective();
});

Deno.test("You can't end a macro definition if one isn't being defined", () => {
    const macroProcessor = processor();
    const ending = macroProcessor.endDirective();
    assertFailure(ending, "macro.end");
});
