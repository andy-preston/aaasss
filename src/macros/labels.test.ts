import { expect } from "jsr:@std/expect";
import { macroFromTable, systemUnderTest, testLines } from "./testing.ts";
import { directiveFunction } from "../directives/directive-function.ts";

Deno.test("Labels in macro operands are expanded on each invocation", () => {
    const system = systemUnderTest();
    const macro = directiveFunction("plop", system.macros.macroDirective);
    const end = directiveFunction("plop", system.macros.endDirective);
    const labelToBeExpanded = "aLabel";

    const startDefinition = macro("testMacro");
    expect(startDefinition.type).not.toBe("failures");
    {
        const pipeline = system.macros.assemblyPipeline(testLines([{
            "macroName": "", "macroCount": 0,
            "label": labelToBeExpanded, "mnemonic": "",
            "symbolicOperands": []
        }]));
        const result = pipeline.next().value!;
        expect(result.failed()).toBeFalsy();
    }
    const endDefinition = end();
    expect(endDefinition.type).not.toBe("failures");
    const testMacro = directiveFunction(
        "testMacro", macroFromTable(system.symbolTable, "testMacro")
    );
    const execution = testMacro();
    expect(execution.type).not.toBe("failures");
    const mockCount = 2;
    {
        const pipeline = system.macros.assemblyPipeline(testLines([{
            "macroName": "testMacro", "macroCount": mockCount,
            "label": "", "mnemonic": "JMP",
            "symbolicOperands": [labelToBeExpanded]
        }]));
        const result = pipeline.next().value!;
        expect(result.failed()).toBeFalsy();
        expect(result.symbolicOperands[0]).toBe(
            `testMacro$${mockCount}$${labelToBeExpanded}`
        );
    }
});

Deno.test("But label operands from outside the macro are left as is", () => {
    const system = systemUnderTest();
    const macro = directiveFunction("plop", system.macros.macroDirective);
    const end = directiveFunction("plop", system.macros.endDirective);
    const labelThatCouldBeExpanded = "aLabel";
    const labelThatWillNotBeExpanded = "aDifferentLabel"

    const startDefinition = macro("testMacro");
    expect(startDefinition.type).not.toBe("failures");
    {
        const pipeline = system.macros.assemblyPipeline(testLines([{
            "macroName": "", "macroCount": 0,
            "label": labelThatCouldBeExpanded, "mnemonic": "",
            "symbolicOperands": []
        }]));
        const result = pipeline.next().value!;
        expect(result.failed()).toBeFalsy();

    }
    const endDefinition = end();
    expect(endDefinition.type).not.toBe("failures");
    const testMacro = directiveFunction(
        "testMacro", macroFromTable(system.symbolTable, "testMacro")
    );
    const execution = testMacro();
    expect(execution.type).not.toBe("failures");
    const mockCount = 3;
    {
        const pipeline = system.macros.assemblyPipeline(testLines([{
            "macroName": "testMacro", "macroCount": mockCount,
            "label": "", "mnemonic": "JMP",
            "symbolicOperands": [labelThatWillNotBeExpanded]
        }]));
        const result = pipeline.next().value!;
        expect(result.failed()).toBeFalsy();
        expect(result.symbolicOperands[0]).toBe(labelThatWillNotBeExpanded);
    }
});

Deno.test("Actual labels in macros are also expanded on playback", () => {
    const system = systemUnderTest();
    const macro = directiveFunction("plop", system.macros.macroDirective);
    const end = directiveFunction("plop", system.macros.endDirective);

    const startDefinition = macro("testMacro");
    expect(startDefinition.type).not.toBe("failures");
    const endDefinition = end();
    expect(endDefinition.type).not.toBe("failures");
    const testMacro = directiveFunction(
        "testMacro", macroFromTable(system.symbolTable, "testMacro")
    );
    const execution = testMacro();
    expect(execution.type).not.toBe("failures");
    const mockCount = 4;
    {
        const pipeline = system.macros.assemblyPipeline(testLines([{
            "macroName": "testMacro", "macroCount": mockCount,
            "label": "aLabel", "mnemonic": "TST",
            "symbolicOperands": []
        }]));
        const result = pipeline.next().value!;
        expect(result.failed()).toBeFalsy();
        expect(result.label).toBe(`testMacro$${mockCount}$aLabel`);
    }
});
