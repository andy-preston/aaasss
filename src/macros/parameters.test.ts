import { assertEquals, assertFalse } from "assert";
import type { Directive, FunctionDirective } from "../directives/data-types.ts";
import { assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { systemUnderTest, testLine } from "./testing.ts";

Deno.test("The macro directive name must be a string", () => {
    const system = systemUnderTest();
    const result = system.macros.macroDirective(47);
    assertFailureWithExtra(result, "type_string", ["47"]);
});

Deno.test("The macro doesn't have to have parameters", () => {
    const system = systemUnderTest();
    const result = system.macros.macroDirective("testMacro", []);
    assertSuccess(result, undefined);
});

Deno.test("If a macro has parameters, they are substituted", () => {
    const system = systemUnderTest();
    assertSuccess(
        system.macros.macroDirective("testMacro", ["a", "b"]),
        undefined
    );
    assertSuccess(system.macros.endDirective(), undefined);

    const testMacro = system.symbolTable.use("testMacro").value as Directive;
    assertSuccess(testMacro("testMacro", ["1", "2"]), "");

    const result = system.macros.lines(
        testLine("testMacro", 1, "", "TST", ["a", "b"])
    );
    assertFalse(result.failed());
    assertEquals(result.mnemonic, "TST");
    assertEquals(result.symbolicOperands, ["1", "2"]);
});

Deno.test("The parameters in a definition must be strings", () => {
    const system = systemUnderTest();
    assertFailureWithExtra(
        system.macros.macroDirective("testMacro", ["a", 2, "b", 3]),
        "type_strings",
        ["1: number", "3: number"]
    );
});

Deno.test("On calling a macro, the parameters must be strings or numbers", () => {
    const system = systemUnderTest();
    assertSuccess(
        system.macros.macroDirective("testMacro", ["a", "b"]), undefined
    );
    assertSuccess(system.macros.endDirective(), undefined);

    const testMacro = system.symbolTable.use("testMacro").value as Directive;
    const result = testMacro(true, {"c": "c"});
    assertFailureWithExtra(
        result, "type_macroParams", ["0: boolean", "1: object"]
    );
});

Deno.test("Parameter count mismatches result in a failure", () => {
    const system = systemUnderTest();
    assertSuccess(
        system.macros.macroDirective("testMacro", ["a", "b", "c"]),
        undefined
    );
    assertSuccess(system.macros.endDirective(), undefined);

    const testMacro = system.symbolTable.use(
        "testMacro"
    ).value as FunctionDirective;
    const result = testMacro("testMacro", ["1", "2"]);
    assertFailureWithExtra(result, "macro_params", ["3"]);
});
