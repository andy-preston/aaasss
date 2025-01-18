import { assertEquals, assertFalse } from "assert";
import type { Label, Mnemonic } from "../source-code/data-types.ts";
import type { LineWithProcessedMacro } from "./line-types.ts";
import { processor } from "./processor.ts";
import { testLine } from "./testing.ts";

const noMacroName = "";

const assertProcessedLine = (
    lines: Array<LineWithProcessedMacro>,
    expectedName: string,
    expectedLabel: Label,
    expectedMnemonic: Mnemonic
) => {
    assertEquals(lines.length, 1);
    const line = lines[0]!;
    assertEquals(line.macroName(), expectedName);
    assertEquals(line.macroBeingDefined(), expectedName != noMacroName);
    assertEquals(line.label, expectedLabel);
    assertEquals(line.mnemonic, expectedMnemonic);
};

Deno.test("Most of the time, lines will just be passed on to the next stage", () => {
    const macroProcessor = processor();
    const testLines = [["testLabel", "TST"], ["", "AND"], ["", "TST"]];
    for (const [label, mnemonic] of testLines) {
        const tokenised = testLine(label!, mnemonic!, []);
        assertProcessedLine(
            macroProcessor.lines(tokenised).toArray(),
            noMacroName, label!, mnemonic!
        );
    }
});

Deno.test("Whilst a macro is being defined, saveLine will... save lines", () => {
    const macroProcessor = processor();
    macroProcessor.define("plop");
    const testLines = [["testLabel", "TST"], ["", "AND"], ["", "TST"]];
    for (const [label, mnemonic] of testLines) {
        const tokenised = testLine(label!, mnemonic!, []);
        const processed = macroProcessor.lines(tokenised).toArray();
        assertProcessedLine(processed, "plop", label!, mnemonic!);
    }
    macroProcessor.end();
    const tokenised = testLine("ended", "TST", []);
    assertProcessedLine(
        macroProcessor.lines(tokenised).toArray(),
        noMacroName, "ended", "TST"
    );
});

Deno.test("Once a macro has been recorded, it can be played-back", () => {
    const macroProcessor = processor();
    macroProcessor.define("plop");
    const testLines = [["testLabel", "TST"], ["", "AND"], ["", "TST"]];
    for (const [label, mnemonic] of testLines) {
        const tokenised = testLine(label!, mnemonic!, []);
        macroProcessor.lines(tokenised).toArray();
    }
    macroProcessor.end();
    macroProcessor.macro("plop", []);

    testLines.push(["ended", "TST"]);
    const tokenised = testLine("ended", "TST", []);
    const lines = macroProcessor.lines(tokenised).toArray();
    assertEquals(lines.length, testLines.length);
    for (const [index, line] of lines.entries()) {
        assertEquals(line.macroName(), noMacroName);
        assertFalse(line.macroBeingDefined());
        assertEquals(line.mnemonic, testLines[index]![1]);
    }
});
