import { assertEquals, assertFalse } from "assert";
import type { Directive } from "../directives/data-types.ts";
import { assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { testEnvironment, testLine } from "./testing.ts";

Deno.test("The macro directive name must be a string", () => {
    const environment = testEnvironment();
    const result = environment.macros.macro(47);
    assertFailureWithExtra(result, "type_string", "47");
});

Deno.test("The macro doesn't have to have parameters", () => {
    const environment = testEnvironment();
    const result = environment.macros.macro("testMacro");
    assertSuccess(result, undefined);
});

Deno.test("If a macro has parameters, they are substituted", () => {
    const environment = testEnvironment();
    assertSuccess(
        environment.macros.macro("testMacro", ["a", "b"]),
        undefined
    );
    assertSuccess(environment.macros.end(), undefined);

    const testMacro = environment.symbolTable.use("testMacro") as Directive;
    assertSuccess(testMacro("1", "2"), undefined);

    const result = environment.macros.lines(
        testLine("testMacro", 1, "", "TST", ["a", "b"])
    );
    assertFalse(result.failed());
    assertEquals(result.mnemonic, "TST");
    assertEquals(result.symbolicOperands, ["1", "2"]);
});

Deno.test("The parameters in a definition must be strings", () => {
    const environment = testEnvironment();
    assertFailureWithExtra(
        environment.macros.macro("testMacro", ["a", 2, "b", 3]),
        "type_strings",
        "1: number, 3: number"
    );
});

Deno.test("On calling a macro, the parameters must be strings or numbers", () => {
    const environment = testEnvironment();
    assertSuccess(environment.macros.macro("testMacro", ["a", "b"]), undefined);
    assertSuccess(environment.macros.end(), undefined);

    const testMacro = environment.symbolTable.use("testMacro") as Directive;
    const result = testMacro(true, {"c": "c"});
    assertFailureWithExtra(result, "type_macroParams", "0: boolean, 1: object");
});

Deno.test("Parameter count mismatches result in a failure", () => {
    const environment = testEnvironment();
    assertSuccess(
        environment.macros.macro("testMacro", ["a", "b", "c"]),
        undefined
    );
    assertSuccess(environment.macros.end(), undefined);

    const testMacro = environment.symbolTable.use("testMacro") as Directive;
    const result = testMacro(1, 2);
    assertFailureWithExtra(result, "macro_params", "3");
});
