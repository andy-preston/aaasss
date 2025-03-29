import { expect } from "jsr:@std/expect";
import { macroFromTable, systemUnderTest, testLine } from "./testing.ts";
import { directiveFunction } from "../directives/directive-function.ts";

const irrelevantName = "testing";

Deno.test("The macro doesn't have to have parameters", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(irrelevantName, system.macros.macroDirective);
    expect(macro("testMacro").type).not.toBe("failures");
});

Deno.test("If a macro has parameters, they are substituted", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const end = directiveFunction(
        irrelevantName, system.macros.endDirective
    );

    expect(macro("testMacro", "a", "b").type).not.toBe("failures");
    expect(end().type).not.toBe("failures");

    const testMacro = directiveFunction(
        "testMacro", macroFromTable(system.symbolTable, "testMacro")
    );
    expect(testMacro("1", "2").type).not.toBe("failures");

    const result = system.macros.lines(
        testLine("testMacro", 1, "", "TST", ["a", "b"])
    );
    expect(result.failed()).toBeFalsy();
    expect(result.mnemonic).toBe("TST");
    expect(result.symbolicOperands).toEqual(["1", "2"]);
});
