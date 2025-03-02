import { assertEquals, assertFalse } from "assert";
import { assertSuccess } from "../failure/testing.ts";
import { macroFromTable, systemUnderTest, testLine } from "./testing.ts";

Deno.test("The macro doesn't have to have parameters", () => {
    const system = systemUnderTest();
    assertSuccess(
        system.macros.macroDirective.body("testMacro", []),
        undefined
    );
});

Deno.test("If a macro has parameters, they are substituted", () => {
    const system = systemUnderTest();
    assertSuccess(
        system.macros.macroDirective.body("testMacro", ["a", "b"]),
        undefined
    );
    assertSuccess(system.macros.endDirective.body(), undefined);

    const testMacro = macroFromTable(system.symbolTable, "testMacro");
    assertSuccess(testMacro("testMacro", ["1", "2"]), "");

    const result = system.macros.lines(
        testLine("testMacro", 1, "", "TST", ["a", "b"])
    );
    assertFalse(result.failed());
    assertEquals(result.mnemonic, "TST");
    assertEquals(result.symbolicOperands, ["1", "2"]);
});
