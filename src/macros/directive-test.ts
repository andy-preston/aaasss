import { assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("The macro directive name must be a string", () => {
    const system = systemUnderTest();
    const result = system.jSExpression("macro(47)");
    assertFailureWithExtra(result, "type_string", ["47"]);
});

Deno.test("The parameters in a definition must be strings", () => {
    const system = systemUnderTest();
    assertFailureWithExtra(
        system.jSExpression('macro("testMacro", "a", 2, "b", 3)'),
        "type_strings",
        ["string", "1: number", "3: number"]
    );
});

Deno.test("On calling a macro, the parameters must be strings or numbers", () => {
    const system = systemUnderTest();
    assertSuccess(system.jSExpression('macro("testMacro", "a", "b")'), "");
    assertSuccess(system.jSExpression('endmacro()'), "");
    assertFailureWithExtra(
        system.jSExpression('testMacro(true, {"c": "c"})'),
        "type_macroParams",
        ["0: boolean", "1: object"]
    );
});

Deno.test("Parameter count mismatches result in a failure", () => {
    const system = systemUnderTest();
    assertSuccess(system.jSExpression('macro("testMacro", "a", "b", "C")'), "");
    assertSuccess(system.jSExpression('endmacro()'), "");
    assertFailureWithExtra(
        system.jSExpression('testMacro("1", "2")'),
        "macro_params",
        ["3"]
    );
});
