import { assertEquals } from "assert";
import { directiveFunction } from "../directives/directive-function.ts";
import type { Failure } from "../failure/bags.ts";
import { assertFailureKind, assertSuccess } from "../failure/testing.ts";
import { systemUnderTest } from "./testing.ts";

const irrelevantName = "testing";

Deno.test("leftInIllegalState returns a failure is a definition wasn't closed", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );

    assertSuccess(macro("plop"));
    const result = system.macros.leftInIllegalState();
    assertEquals(result.type, "failures");
    assertFailureKind(result.it as Array<Failure>, "macro_noEnd");
});

Deno.test("You can't define a macro whilst still in definition mode", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );

    assertSuccess(macro("aMacro"));
    const result = macro("anotherOne");
    assertEquals(result.type, "failures");
    assertFailureKind(result.it as Array<Failure>, "macro_multiDefine");
});

Deno.test("Multiple macros can be defined", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const end = directiveFunction(
        irrelevantName, system.macros.endDirective
    );

    for (const macroName of ["aMacro", "anotherOne", "yetAnotherOne"]) {
        assertSuccess(macro(macroName));
        assertSuccess(end());
    };
});

Deno.test("You can't end a macro definition if one isn't being defined", () => {
    const system = systemUnderTest();
    const end = directiveFunction(
        irrelevantName, system.macros.endDirective
    );

    const result = end();
    assertEquals(result.type, "failures");
    assertFailureKind(result.it as Array<Failure>, "macro_end");
});
