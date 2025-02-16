import { assert, assertEquals, assertNotEquals } from "assert";
import type { Directive } from "../directives/data-types.ts";
import { assertSuccess } from "../failure/testing.ts";
import { testEnvironment, testLine, testLineWithSource } from "./testing.ts";
import { failure } from "../failure/failure-or-box.ts";

const testLines: Array<[string, string]> = [
    ["testLabel", "TST"],
    ["testLabel", "AND"],
    ["",          "TST"]
] as const;

const noPlaybackName = "";

const noPlaybackCount = 0;

Deno.test("Most of the time, lines will just be passed on to the next stage", () => {
    const environment = testEnvironment();
    for (const [label, mnemonic] of testLines) {
        const line = environment.macros.lines(
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
    const environment = testEnvironment();

    environment.macros.macro("testMacro");
    for (const [label, mnemonic] of testLines) {
        const line = environment.macros.lines(
            testLine("", 0, label, mnemonic, [])
        );
        assertEquals(line.isRecordingMacro, true);
    }

    environment.macros.end();
    for (const [label, mnemonic] of testLines) {
        const line = environment.macros.lines(
            testLine("", 0, label, mnemonic, [])
        );
        assertEquals(line.isRecordingMacro, false);
    }
});

Deno.test("Once a macro has been recorded, it can be played-back", () => {
    const environment = testEnvironment();

    environment.macros.macro("testMacro");
    const skipFirstLine = environment.macros.lines(testLine("", 0, "", "", []));
    assert(skipFirstLine.isRecordingMacro);
    for (const [label, mnemonic] of testLines) {
        const reconstructedLabel = label ? `${label}: ` : "";
        const reconstructedSource = `${reconstructedLabel}${mnemonic}`;
        environment.macros.lines(
            testLineWithSource(reconstructedSource, label, mnemonic, [])
        );
    }
    environment.macros.end();
    const testMacro = environment.symbolTable.use("testMacro") as Directive;

    assertSuccess(testMacro(), undefined);
    const lines = environment.mockFileStack.lines();
    for (const [label, mnemonic] of testLines) {
        const lineSourceCode = lines.next().value!.rawSource;
        assert(lineSourceCode.includes(label));
        assert(lineSourceCode.includes(mnemonic));
    }
});

Deno.test("Lines with failures are not recorded in the macro", () => {
    const environment = testEnvironment();

    environment.macros.macro("testMacro");
    const skipFirstLine = environment.macros.lines(testLine("", 0, "", "", []));
    assert(skipFirstLine.isRecordingMacro);

    const failingLine = testLineWithSource("I have failed!", "", "", []);
    failingLine.withFailure(failure(undefined, "type_positive", "negative"));
    environment.macros.lines(failingLine);
    environment.macros.lines(testLineWithSource("OK!", "", "", []));
    environment.macros.end();
    const testMacro = environment.symbolTable.use("testMacro") as Directive;

    assertSuccess(testMacro(), undefined);
    let count = 0;
    for (const line of environment.mockFileStack.lines()) {
        count = count + 1;
        assertNotEquals(line.rawSource, "I have failed!");
        assertEquals(line.rawSource, "OK!");
    }
    assertEquals(count, 1);
});

Deno.test("Lines that are being replayed have a macro name and count", () => {
    const environment = testEnvironment();

    environment.macros.macro("testMacro");
    for (const [label, mnemonic] of testLines) {
        environment.macros.lines(
            testLine("", 0, label, mnemonic, [])
        );
    }
    environment.macros.end();

    for (const expectedCount of [1, 2, 3]) {
        const testMacro = environment.symbolTable.use("testMacro") as Directive;
        assertSuccess(testMacro(), undefined);
        for (const line of environment.mockFileStack.lines()) {
            assertEquals(line.macroName, "testMacro");
            assertEquals(line.macroCount, expectedCount);
        }
    }
});
