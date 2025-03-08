import { assertEquals, assertFalse } from "assert";
import { assertSuccess } from "../failure/testing.ts";
import { macroFromTable, systemUnderTest, testLine } from "./testing.ts";
import { directiveFunction } from "../directives/directive-function.ts";

const irrelevantName = "testing";

Deno.test("The macro doesn't have to have parameters", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(irrelevantName, system.macros.macroDirective);
    assertSuccess(macro("testMacro"));
});

Deno.test("If a macro has parameters, they are substituted", () => {
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
    assertSuccess(testMacro("1", "2"));

    const result = system.macros.lines(
        testLine("testMacro", 1, "", "TST", ["a", "b"])
    );
    assertFalse(result.failed());
    assertEquals(result.mnemonic, "TST");
    assertEquals(result.symbolicOperands, ["1", "2"]);
});
