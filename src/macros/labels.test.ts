import { assert, assertEquals, assertFalse } from "assert";
import { assertSuccess } from "../failure/testing.ts";
import { macroFromTable, systemUnderTest, testLine } from "./testing.ts";

Deno.test("Labels in macro operands are expanded on each invocation", () => {
    const system = systemUnderTest();
    assertSuccess(
        system.macros.macroDirective.body("testMacro", []),
        undefined
    );
    const skipFirstLine = system.macros.lines(testLine("", 0, "", "", []));
    assert(skipFirstLine.isRecordingMacro);
    const lineWithLabel = system.macros.lines(
        testLine("", 0, "aLabel", "", [])
    );
    assertFalse(lineWithLabel.failed());
    assertSuccess(
        system.macros.endDirective.body(),
        undefined
    );

    const testMacro = macroFromTable(system.symbolTable, "testMacro");
    assertSuccess(testMacro("testMacro", []), "");
    const mockCount = 2;

    const line = system.macros.lines(
        testLine("testMacro", mockCount, "", "JMP", ["aLabel"])
    );
    assertEquals(line.symbolicOperands[0], `testMacro$${mockCount}$aLabel`);
});

Deno.test("But label operands from outside the macro are left as is", () => {
    const system = systemUnderTest();
    assertSuccess(
        system.macros.macroDirective.body("testMacro", []),
        undefined
    );
    const skipFirstLine = system.macros.lines(testLine("", 0, "", "", []));
    assert(skipFirstLine.isRecordingMacro);
    const lineWithLabel = system.macros.lines(
        testLine("", 0, "aLabel", "", [])
    );
    assertFalse(lineWithLabel.failed());
    assertSuccess(
        system.macros.endDirective.body(),
        undefined
    );

    const testMacro = macroFromTable(system.symbolTable, "testMacro");
    assertSuccess(testMacro("testMacro", []), "");
    const mockCount = 2;
    const line = system.macros.lines(
        testLine("testMacro", mockCount, "", "JMP", ["differentLabel"])
    );
    assertEquals(line.symbolicOperands[0], "differentLabel");
});

Deno.test("Actual labels in macros are also expanded on playback", () => {
    const system = systemUnderTest();
    assertSuccess(
        system.macros.macroDirective.body("testMacro", []),
        undefined
    );
    const skipFirstLine = system.macros.lines(testLine("", 0, "", "", []));
    assert(skipFirstLine.isRecordingMacro);
    assertSuccess(
        system.macros.endDirective.body(),
        undefined
    );

    const testMacro = macroFromTable(system.symbolTable, "testMacro");
    assertSuccess(testMacro("testMacro", []), "");
    const mockCount = 2;
    const line = system.macros.lines(
        testLine("testMacro", mockCount, "aLabel", "TST", [])
    );
    assertEquals(line.label, `testMacro$${mockCount}$aLabel`);
});
