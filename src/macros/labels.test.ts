import { expect } from "jsr:@std/expect";
import { macroFromTable, systemUnderTest, testLine } from "./testing.ts";
import { directiveFunction } from "../directives/directive-function.ts";

const irrelevantName = "testing";

Deno.test("Labels in macro operands are expanded on each invocation", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const end = directiveFunction(
        irrelevantName, system.macros.endDirective
    );

    expect(macro("testMacro").type).not.toBe("failures");
    const skipFirstLine = system.macros.lines(testLine("", 0, "", "", []));
    expect(skipFirstLine.isRecordingMacro).toBeTruthy();
    const lineWithLabel = system.macros.lines(
        testLine("", 0, "aLabel", "", [])
    );
    expect(lineWithLabel.failed()).toBeFalsy();
    expect(end().type).not.toBe("failures");

    const testMacro = directiveFunction(
        "testMacro", macroFromTable(system.symbolTable, "testMacro")
    );
    expect(testMacro().type).not.toBe("failures");
    const mockCount = 2;

    const line = system.macros.lines(
        testLine("testMacro", mockCount, "", "JMP", ["aLabel"])
    );
    expect(line.symbolicOperands[0]).toBe(`testMacro$${mockCount}$aLabel`);
});

Deno.test("But label operands from outside the macro are left as is", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const end = directiveFunction(
        irrelevantName, system.macros.endDirective
    );

    expect(macro("testMacro").type).not.toBe("failures");
    const skipFirstLine = system.macros.lines(testLine("", 0, "", "", []));
    expect(skipFirstLine.isRecordingMacro).toBeTruthy();
    const lineWithLabel = system.macros.lines(
        testLine("", 0, "aLabel", "", [])
    );
    expect(lineWithLabel.failed()).toBeFalsy();
    expect(end().type).not.toBe("failures");

    const testMacro = directiveFunction(
        "testMacro", macroFromTable(system.symbolTable, "testMacro")
    );
    expect(testMacro().type).not.toBe("failures");
    const mockCount = 2;
    const line = system.macros.lines(
        testLine("testMacro", mockCount, "", "JMP", ["differentLabel"])
    );
    expect(line.symbolicOperands[0]).toBe("differentLabel");
});

Deno.test("Actual labels in macros are also expanded on playback", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const end = directiveFunction(
        irrelevantName, system.macros.endDirective
    );

    expect(macro("testMacro").type).not.toBe("failures");
    const skipFirstLine = system.macros.lines(testLine("", 0, "", "", []));
    expect(skipFirstLine.isRecordingMacro).toBeTruthy();
    expect(end().type).not.toBe("failures");

    const testMacro = directiveFunction(
        "testMacro", macroFromTable(system.symbolTable, "testMacro")
    );
    expect(testMacro().type).not.toBe("failures");
    const mockCount = 2;
    const line = system.macros.lines(
        testLine("testMacro", mockCount, "aLabel", "TST", [])
    );
    expect(line.label).toBe(`testMacro$${mockCount}$aLabel`);
});
