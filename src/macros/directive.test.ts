import { assertEquals } from "assert";
import { directiveFunction } from "../directives/directive-function.ts";
import type { Failure } from "../failure/bags.ts";
import { assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { macroFromTable, systemUnderTest } from "./testing.ts";

const irrelevantName = "testing";

Deno.test("The macro directive name must be a string", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const result = macro(47);
    assertEquals(result.type, "failures");
    assertFailureWithExtra(
        result.it as Array<Failure>, "parameter_type", ["string", "0: number"]
    );
});

Deno.test("The parameters in a definition must be strings", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const result = macro("testMacro", "a", 2, "b", 3);
    assertEquals(result.type, "failures");
    assertFailureWithExtra(
        result.it as Array<Failure>, "parameter_type", ["string", "2: number", "4: number"]
    );
});

Deno.test("On calling a macro, the parameters must be strings or numbers", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const end = directiveFunction(
        irrelevantName, system.macros.endDirective
    );

    assertSuccess(macro("testMacro", "a", "b"));
    assertSuccess(end());
    const testMacro = directiveFunction(
        "testMacro", macroFromTable(system.symbolTable, "testMacro")
    );
    const result = testMacro(true, {"c": "c"});
    assertEquals(result.type, "failures");
    assertFailureWithExtra(
        result.it as Array<Failure>, "parameter_type", ["string, number", "0: boolean", "1: object"]
    );
});

Deno.test("Parameter count mismatches result in a failure", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const end = directiveFunction(
        irrelevantName, system.macros.endDirective
    );

    assertSuccess(macro("testMacro", "a", "b", "C"));
    assertSuccess(end());
    const testMacro = directiveFunction(
        "testMacro", macroFromTable(system.symbolTable, "testMacro")
    );
    const result = testMacro("1", "2");
    assertEquals(result.type, "failures");
    assertFailureWithExtra(
        result.it as Array<Failure>, "macro_params", ["3"]
    );
});
