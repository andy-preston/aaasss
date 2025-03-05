import { assert, assertEquals, assertFalse } from "assert";
import { assertSuccess } from "../failure/testing.ts";
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

    assertSuccess(macro("testMacro"), "");
    const skipFirstLine = system.macros.lines(testLine("", 0, "", "", []));
    assert(skipFirstLine.isRecordingMacro);
    const lineWithLabel = system.macros.lines(
        testLine("", 0, "aLabel", "", [])
    );
    assertFalse(lineWithLabel.failed());
    assertSuccess(end(), "");

    const testMacro = directiveFunction(
        "testMacro", macroFromTable(system.symbolTable, "testMacro")
    );
    assertSuccess(testMacro(), "");
    const mockCount = 2;

    const line = system.macros.lines(
        testLine("testMacro", mockCount, "", "JMP", ["aLabel"])
    );
    assertEquals(line.symbolicOperands[0], `testMacro$${mockCount}$aLabel`);
});

Deno.test("But label operands from outside the macro are left as is", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const end = directiveFunction(
        irrelevantName, system.macros.endDirective
    );

    assertSuccess(macro("testMacro"), "");
    const skipFirstLine = system.macros.lines(testLine("", 0, "", "", []));
    assert(skipFirstLine.isRecordingMacro);
    const lineWithLabel = system.macros.lines(
        testLine("", 0, "aLabel", "", [])
    );
    assertFalse(lineWithLabel.failed());
    assertSuccess(end(), "");

    const testMacro = directiveFunction(
        "testMacro", macroFromTable(system.symbolTable, "testMacro")
    );
    assertSuccess(testMacro(), "");
    const mockCount = 2;
    const line = system.macros.lines(
        testLine("testMacro", mockCount, "", "JMP", ["differentLabel"])
    );
    assertEquals(line.symbolicOperands[0], "differentLabel");
});

Deno.test("Actual labels in macros are also expanded on playback", () => {
    const system = systemUnderTest();
    const macro = directiveFunction(
        irrelevantName, system.macros.macroDirective
    );
    const end = directiveFunction(
        irrelevantName, system.macros.endDirective
    );

    assertSuccess(macro("testMacro"), "");
    const skipFirstLine = system.macros.lines(testLine("", 0, "", "", []));
    assert(skipFirstLine.isRecordingMacro);
    assertSuccess(end(), "");

    const testMacro = directiveFunction(
        "testMacro", macroFromTable(system.symbolTable, "testMacro")
    );
    assertSuccess(testMacro(), "");
    const mockCount = 2;
    const line = system.macros.lines(
        testLine("testMacro", mockCount, "aLabel", "TST", [])
    );
    assertEquals(line.label, `testMacro$${mockCount}$aLabel`);
});
