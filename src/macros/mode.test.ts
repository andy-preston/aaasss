import { directiveFunction } from "../directives/directive-function.ts";
import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { systemUnderTest } from "./testing.ts";

const irrelevantName = "testing";

Deno.test("leftInIllegalState returns a failure is a definition wasn't closed", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );

    assertSuccess(macro("plop"), "");
    assertFailure(system.macros.leftInIllegalState(), "macro_noEnd");
});

Deno.test("You can't define a macro whilst still in definition mode", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );

    assertSuccess(macro("aMacro"), "");
    assertFailure(macro("anotherOne"), "macro_multiDefine");
});

Deno.test("Multiple macros can be defined", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const end = directiveFunction(
        irrelevantName, system.macros.endDirective
    );

    assertSuccess(macro("aMacro"), "");
    assertSuccess(end(), "");

    assertSuccess(macro("anotherOne"), "");
    assertSuccess(end(), "");
});

Deno.test("You can't end a macro definition if one isn't being defined", () => {
    const system = systemUnderTest();
    const end = directiveFunction(
        irrelevantName, system.macros.endDirective
    );
    assertFailure(end(), "macro_end");
});
