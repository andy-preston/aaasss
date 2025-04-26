import { expect } from "jsr:@std/expect";
import { macroFromTable, systemUnderTest, testLines } from "./testing.ts";
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

    const definition = macro("testMacro", "a", "b");
    expect(definition.type).not.toBe("failures");
    const finishedDefinition = end();
    expect(finishedDefinition.type).not.toBe("failures");

    const testMacro = directiveFunction(
        "testMacro", macroFromTable(system.symbolTable, "testMacro")
    );
    const execution = testMacro("1", "2");
    expect(execution.type).not.toBe("failures");
    const firstExecution = 1;
    const pipeline = system.macros.assemblyPipeline(testLines([{
        "macroName": "testMacro", "macroCount": firstExecution,
        "label": "", "mnemonic": "TST", "symbolicOperands": ["a", "b"]
    }]));
    const result = pipeline.next().value!;
    expect(result.failed()).toBeFalsy();
    expect(result.mnemonic).toBe("TST");
    expect(result.symbolicOperands).toEqual(["1", "2"]);
});
