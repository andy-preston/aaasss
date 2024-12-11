import { assertEquals } from "assert";
import type { Label, Mnemonic } from "../source-code/data-types.ts";
import {
    lineWithRawSource, lineWithRenderedJavascript
} from "../source-code/line-types.ts";
import { lineWithTokens } from "../tokenise/line-types.ts";
import type { LineWithProcessedMacro } from "./line-types.ts";
import { processor } from "./processor.ts";

const testLine = (label: Label, mnemonic: Mnemonic) => {
    const raw = lineWithRawSource("", 0, "", []);
    const rendered = lineWithRenderedJavascript(raw, "", []);
    return lineWithTokens(rendered, label, mnemonic, [], []);
};

const assertProcessedLine = (
    lines: Array<LineWithProcessedMacro>,
    expectedName: string,
    expectedLabel: Label,
    expectedMnemonic: Mnemonic
) => {
    assertEquals(lines.length, 1);
    const line = lines[0]!;
    assertEquals(line.macroName, expectedName);
    assertEquals(line.label, expectedLabel);
    assertEquals(line.mnemonic, expectedMnemonic);
};

const noMacroName = "";

Deno.test("Most of the time, lines will just be passed on to the next stage", () => {
    const macroProcessor = processor();
    const testLines = [["testLabel", "TST"], ["", "AND"], ["", "TST"]];
    for (const [label, mnemonic] of testLines) {
        const tokenised = testLine(label!, mnemonic!);
        assertProcessedLine(
            macroProcessor.lines(tokenised).toArray(),
            noMacroName, label!, mnemonic!
        );
    }
});

Deno.test("Whilst a macro is being defined, saveLine will... save lines", () => {
    const macroProcessor = processor();
    macroProcessor.defineDirective("plop");
    const testLines = [["testLabel", "TST"], ["", "AND"], ["", "TST"]];
    for (const [label, mnemonic] of testLines) {
        const tokenised = testLine(label!, mnemonic!);
        assertProcessedLine(
            macroProcessor.lines(tokenised).toArray(),
            "plop", label!, mnemonic!
        );
    }
    macroProcessor.endDirective();
    const tokenised = testLine("ended", "TST");
    assertProcessedLine(
        macroProcessor.lines(tokenised).toArray(),
        noMacroName, "ended", "TST"
    );
});

Deno.test("Once a macro has been recorded, it can be played-back", () => {
    const macroProcessor = processor();
    macroProcessor.defineDirective("plop");
    const testLines = [["testLabel", "TST"], ["", "AND"], ["", "TST"]];
    for (const [label, mnemonic] of testLines) {
        const tokenised = testLine(label!, mnemonic!);
        macroProcessor.lines(tokenised).toArray();
    }
    macroProcessor.endDirective();
    macroProcessor.macroDirective("plop", []);

    testLines.push(["ended", "TST"]);
    const tokenised = testLine("ended", "TST");
    const lines = macroProcessor.lines(tokenised).toArray();
    assertEquals(lines.length, testLines.length);
    for (const [index, line] of lines.entries()) {
        assertEquals(line.macroName, noMacroName);
        assertEquals(line.mnemonic, testLines[index]![1]);
    }
});
