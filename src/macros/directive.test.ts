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
    {
        const failure = failures[0] as TypeFailure;
        expect(failure.kind).toBe("type_failure");
        expect(failure.location).toEqual({"parameter": 2});
        expect(failure.expected).toEqual("string");
        expect(failure.actual).toEqual("number");
    } {
        const failure = failures[1] as TypeFailure;
        expect(failure.kind).toBe("type_failure");
        expect(failure.location).toEqual({"parameter": 4});
        expect(failure.expected).toBe("string");
        expect(failure.actual).toBe("number");
    }
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
    {
        const failure = failures[0] as TypeFailure;
        expect(failure.kind).toBe("type_failure");
        expect(failure.location).toEqual({"parameter": 0});
        expect(failure.expected).toBe("string, number");
        expect(failure.actual).toBe("boolean");
    } {
        const failure = failures[1] as TypeFailure;
        expect(failure.kind).toBe("type_failure");
        expect(failure.location).toEqual({"parameter": 1});
        expect(failure.expected).toBe("string, number");
        expect(failure.actual).toBe("object");
    }
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

Deno.test("A macro can be defined in both passes", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const end = directiveFunction(
        irrelevantName, system.macros.endDirective
    );
    {
        expect(macro("testMacro").type).not.toBe("failures");
        expect(end().type).not.toBe("failures");
        const testMacro = directiveFunction(
            "testMacro", macroFromTable(system.symbolTable, "testMacro")
        );
        const result = testMacro();
        expect(result.type).not.toBe("failures");
    } {
        system.pass.second();
        expect(system.symbolTable.alreadyInUse("testMacro")).toBeFalsy();

        expect(macro("testMacro").type).not.toBe("failures");
        expect(end().type).not.toBe("failures");
        const testMacro = directiveFunction(
            "testMacro", macroFromTable(system.symbolTable, "testMacro")
        );
        const result = testMacro();
        expect(result.type).not.toBe("failures");
    }
});
