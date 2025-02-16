import { assert, assertEquals, assertFalse } from "assert";
import type { Directive } from "../directives/data-types.ts";
import { assertSuccess } from "../failure/testing.ts";
import { testEnvironment, testLine } from "./testing.ts";

Deno.test("Labels in macro operands are expanded on each invocation", () => {
    const environment = testEnvironment();
    assertSuccess(environment.macros.macro("testMacro"), undefined);
    const skipFirstLine = environment.macros.lines(testLine("", 0, "", "", []));
    assert(skipFirstLine.isRecordingMacro);
    const lineWithLabel = environment.macros.lines(
        testLine("", 0, "aLabel", "", [])
    );
    assertFalse(lineWithLabel.failed());
    assertSuccess(environment.macros.end(), undefined);

    const testMacro = environment.symbolTable.use("testMacro") as Directive;
    assertSuccess(testMacro(), undefined);
    const mockCount = 2;

    const line = environment.macros.lines(
        testLine("testMacro", mockCount, "", "JMP", ["aLabel"])
    );
    assertEquals(line.symbolicOperands[0], `testMacro$${mockCount}$aLabel`);
});

Deno.test("But label operands from outside the macro are left as is", () => {
    const environment = testEnvironment();
    assertSuccess(environment.macros.macro("testMacro"), undefined);
    const skipFirstLine = environment.macros.lines(testLine("", 0, "", "", []));
    assert(skipFirstLine.isRecordingMacro);
    const lineWithLabel = environment.macros.lines(
        testLine("", 0, "aLabel", "", [])
    );
    assertFalse(lineWithLabel.failed());
    assertSuccess(environment.macros.end(), undefined);

    const testMacro = environment.symbolTable.use("testMacro") as Directive;
    assertSuccess(testMacro(), undefined);
    const mockCount = 2;
    const line = environment.macros.lines(
        testLine("testMacro", mockCount, "", "JMP", ["differentLabel"])
    );
    assertEquals(line.symbolicOperands[0], "differentLabel");
});

Deno.test("Actual labels in macros are also expanded on playback", () => {
    const environment = testEnvironment();
    assertSuccess(environment.macros.macro("testMacro"), undefined);
    const skipFirstLine = environment.macros.lines(testLine("", 0, "", "", []));
    assert(skipFirstLine.isRecordingMacro);
    assertSuccess(environment.macros.end(), undefined);

    const testMacro = environment.symbolTable.use("testMacro") as Directive;
    assertSuccess(testMacro(), undefined);
    const mockCount = 2;
    const line = environment.macros.lines(
        testLine("testMacro", mockCount, "aLabel", "TST", [])
    );
    assertEquals(line.label, `testMacro$${mockCount}$aLabel`);
});
