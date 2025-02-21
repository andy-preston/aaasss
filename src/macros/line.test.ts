import { assert, assertEquals, assertNotEquals } from "assert";
import type { Directive } from "../directives/data-types.ts";
import { assertSuccess } from "../failure/testing.ts";
import { systemUnderTest, testLine, testLineWithSource } from "./testing.ts";
import { failure } from "../failure/failure-or-box.ts";

const testLines: Array<[string, string]> = [
    ["testLabel", "TST"],
    ["testLabel", "AND"],
    ["",          "TST"]
] as const;

const noPlaybackName = "";

const noPlaybackCount = 0;

Deno.test("Most of the time, lines will just be passed on to the next stage", () => {
    const system = systemUnderTest();
    for (const [label, mnemonic] of testLines) {
        const line = system.macros.lines(
            testLine("", 0, label, mnemonic, [])
        );
        assertEquals(line.isRecordingMacro, false);
        assertEquals(line.macroName, noPlaybackName);
        assertEquals(line.macroCount, noPlaybackCount);
        assertEquals(line.label, label);
        assertEquals(line.mnemonic, mnemonic);
    }
});

Deno.test("Whilst a macro is being defined, the isRecording flag is set", () => {
    const system = systemUnderTest();

    system.macros.macroDirective("testMacro");
    for (const [label, mnemonic] of testLines) {
        const line = system.macros.lines(
            testLine("", 0, label, mnemonic, [])
        );
        assertEquals(line.isRecordingMacro, true);
    }

    system.macros.endDirective();
    for (const [label, mnemonic] of testLines) {
        const line = system.macros.lines(
            testLine("", 0, label, mnemonic, [])
        );
        assertEquals(line.isRecordingMacro, false);
    }
});

Deno.test("Once a macro has been recorded, it can be played-back", () => {
    const system = systemUnderTest();

    system.macros.macroDirective("testMacro");
    const skipFirstLine = system.macros.lines(testLine("", 0, "", "", []));
    assert(skipFirstLine.isRecordingMacro);
    for (const [label, mnemonic] of testLines) {
        const reconstructedLabel = label ? `${label}: ` : "";
        const reconstructedSource = `${reconstructedLabel}${mnemonic}`;
        system.macros.lines(
            testLineWithSource(reconstructedSource, label, mnemonic, [])
        );
    }
    system.macros.endDirective();
    const testMacro = system.symbolTable.use("testMacro") as Directive;

    assertSuccess(testMacro(), undefined);
    const lines = system.mockFileStack.lines();
    for (const [label, mnemonic] of testLines) {
        const lineSourceCode = lines.next().value!.rawSource;
        assert(lineSourceCode.includes(label));
        assert(lineSourceCode.includes(mnemonic));
    }
});

Deno.test("Lines with failures are not recorded in the macro", () => {
    const system = systemUnderTest();

    system.macros.macroDirective("testMacro");
    const skipFirstLine = system.macros.lines(testLine("", 0, "", "", []));
    assert(skipFirstLine.isRecordingMacro);

    const failingLine = testLineWithSource("I have failed!", "", "", []);
    failingLine.withFailure(failure(undefined, "type_positive", ["negative"]));
    system.macros.lines(failingLine);
    system.macros.lines(testLineWithSource("OK!", "", "", []));
    system.macros.endDirective();
    const testMacro = system.symbolTable.use("testMacro") as Directive;

    assertSuccess(testMacro(), undefined);
    let count = 0;
    for (const line of system.mockFileStack.lines()) {
        count = count + 1;
        assertNotEquals(line.rawSource, "I have failed!");
        assertEquals(line.rawSource, "OK!");
    }
    assertEquals(count, 1);
});

Deno.test("Lines that are being replayed have a macro name and count", () => {
    const system = systemUnderTest();

    system.macros.macroDirective("testMacro");
    for (const [label, mnemonic] of testLines) {
        system.macros.lines(
            testLine("", 0, label, mnemonic, [])
        );
    }
    system.macros.endDirective();

    for (const expectedCount of [1, 2, 3]) {
        const testMacro = system.symbolTable.use("testMacro") as Directive;
        assertSuccess(testMacro(), undefined);
        for (const line of system.mockFileStack.lines()) {
            assertEquals(line.macroName, "testMacro");
            assertEquals(line.macroCount, expectedCount);
        }
    }
});
