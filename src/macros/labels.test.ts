import { expect } from "jsr:@std/expect";
import { systemUnderTest, testPipelineWithLines } from "./testing.ts";

Deno.test("Labels in macro operands are expanded on each invocation", () => {
    const system = systemUnderTest();
    const labelToBeExpanded = "aLabel";

    const define = system.macros.define("testMacro", []);
    expect(define.type).not.toBe("failures");
    {
        const pipeline = testPipelineWithLines(system, [{
            "macroName": "", "macroCount": 0,
            "label": labelToBeExpanded, "mnemonic": "",
            "symbolicOperands": []
        }]);
        const result = pipeline.next().value!;
        expect(result.failed()).toBeFalsy();
    }
    const end = system.macros.end();
    expect(end.type).not.toBe("failures");
    const use = system.macros.use("testMacro", []);
    expect(use.type).not.toBe("failures");
    const mockCount = 2;
    {
        const pipeline = testPipelineWithLines(system, [{
            "macroName": "testMacro", "macroCount": mockCount,
            "label": "", "mnemonic": "JMP",
            "symbolicOperands": [labelToBeExpanded]
        }]);
        const result = pipeline.next().value!;
        expect(result.failed()).toBeFalsy();
        expect(result.symbolicOperands[0]).toBe(
            `testMacro$${mockCount}$${labelToBeExpanded}`
        );
    }
});

Deno.test("But label operands from outside the macro are left as is", () => {
    const system = systemUnderTest();
    const labelThatCouldBeExpanded = "aLabel";
    const labelThatWillNotBeExpanded = "aDifferentLabel"

    const define = system.macros.define("testMacro", []);
    expect(define.type).not.toBe("failures");
    {
        const pipeline = testPipelineWithLines(system, [{
            "macroName": "", "macroCount": 0,
            "label": labelThatCouldBeExpanded, "mnemonic": "",
            "symbolicOperands": []
        }]);
        const result = pipeline.next().value!;
        expect(result.failed()).toBeFalsy();

    }
    const end = system.macros.end();
    expect(end.type).not.toBe("failures");
    const use = system.macros.use("testMacro", []);
    expect(use.type).not.toBe("failures");
    const mockCount = 3;
    {
        const pipeline = testPipelineWithLines(system, [{
            "macroName": "testMacro", "macroCount": mockCount,
            "label": "", "mnemonic": "JMP",
            "symbolicOperands": [labelThatWillNotBeExpanded]
        }]);
        const result = pipeline.next().value!;
        expect(result.failed()).toBeFalsy();
        expect(result.symbolicOperands[0]).toBe(labelThatWillNotBeExpanded);
    }
});

Deno.test("Actual labels in macros are also expanded on playback", () => {
    const system = systemUnderTest();

    const define = system.macros.define("testMacro", []);
    expect(define.type).not.toBe("failures");
    const end = system.macros.end();
    expect(end.type).not.toBe("failures");
    const use = system.macros.use("testMacro", []);
    expect(use.type).not.toBe("failures");
    const mockCount = 4;
    {
        const pipeline = testPipelineWithLines(system, [{
            "macroName": "testMacro", "macroCount": mockCount,
            "label": "aLabel", "mnemonic": "TST",
            "symbolicOperands": []
        }]);
        const result = pipeline.next().value!;
        expect(result.failed()).toBeFalsy();
        expect(result.label).toBe(`testMacro$${mockCount}$aLabel`);
    }
});
