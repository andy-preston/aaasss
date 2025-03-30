import { expect } from "jsr:@std/expect";
import { directiveFunction } from "../directives/directive-function.ts";
import type { ClueFailure, Failure, TypeFailure } from "../failure/bags.ts";
import { macroFromTable, systemUnderTest } from "./testing.ts";

const irrelevantName = "testing";

Deno.test("The macro directive name must be a string", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const result = macro(47);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as TypeFailure;
    expect(failure.kind).toBe("type_failure");
    expect(failure.location).toEqual({"parameter": 0});
    expect(failure.expected).toBe("string");
    expect(failure.actual).toEqual("number");
});

Deno.test("The parameters in a definition must be strings", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const result = macro("testMacro", "a", 2, "b", 3);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(2);

    const firstFailure = failures[0] as TypeFailure;
    expect(firstFailure.kind).toBe("type_failure");
    expect(firstFailure.location).toEqual({"parameter": 2});
    expect(firstFailure.expected).toEqual("string");
    expect(firstFailure.actual).toEqual("number");

    const secondFailure = failures[1] as TypeFailure;
    expect(secondFailure.kind).toBe("type_failure");
    expect(secondFailure.location).toEqual({"parameter": 4});
    expect(secondFailure.expected).toBe("string");
    expect(secondFailure.actual).toBe("number");
});

Deno.test("On calling a macro, the parameters must be strings or numbers", () => {
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
    const result = testMacro(true, {"c": "c"});
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(2);

    const firstFailure = failures[0] as TypeFailure;
    expect(firstFailure.kind).toBe("type_failure");
    expect(firstFailure.location).toEqual({"parameter": 0});
    expect(firstFailure.expected).toBe("string, number");
    expect(firstFailure.actual).toBe("boolean");

    const secondFailure = failures[1] as TypeFailure;
    expect(secondFailure.kind).toBe("type_failure");
    expect(secondFailure.location).toEqual({"parameter": 1});
    expect(secondFailure.expected).toBe("string, number");
    expect(secondFailure.actual).toBe("object");
});

Deno.test("Parameter count mismatches result in a failure", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const end = directiveFunction(
        irrelevantName, system.macros.endDirective
    );

    expect(macro("testMacro", "a", "b", "C").type).not.toBe("failures");
    expect(end().type).not.toBe("failures");
    const testMacro = directiveFunction(
        "testMacro", macroFromTable(system.symbolTable, "testMacro")
    );
    const result = testMacro("1", "2");
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as ClueFailure;
    expect(failure.kind).toBe("macro_params");
    expect(failure.clue).toBe("3");
});
