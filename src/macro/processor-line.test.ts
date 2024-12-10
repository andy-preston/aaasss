import { assertEquals } from "assert";
import type { Label, Mnemonic } from "../source-code/data-types.ts";
import { assemblyLine, rawLine } from "../source-code/line-types.ts";
import { tokenisedLine } from "../tokenise/tokenised-line.ts";
import type { ExpandedLine } from "./line-types.ts";
import { processor } from "./processor.ts";

const testLine = (label: string, mnemonic: string) => {
    const raw = rawLine("", 0, "", []);
    const assembly = assemblyLine(raw, "", []);
    return tokenisedLine(assembly, label, mnemonic, [], []);
};

const assertExpandedLine = (
    expandedLines: Array<ExpandedLine>,
    expectedName: string,
    expectedLabel: Label,
    expectedMnemonic: Mnemonic
) => {
    assertEquals(expandedLines.length, 1);
    const expanded = expandedLines[0]!;
    assertEquals(expanded.macroName, expectedName);
    assertEquals(expanded.label, expectedLabel);
    assertEquals(expanded.mnemonic, expectedMnemonic);
};

const noMacroName = "";

Deno.test("Most of the time, lines will just be passed on to the next stage", () => {
    const macroProcessor = processor();
    const testLines = [["testLabel", "TST"], ["", "AND"], ["", "TST"]];
    for (const [label, mnemonic] of testLines) {
        const tokenised = testLine(label!, mnemonic!);
        assertExpandedLine(
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
        assertExpandedLine(
            macroProcessor.lines(tokenised).toArray(),
            "plop", label!, mnemonic!
        );
    }
    macroProcessor.endDirective();
    const tokenised = testLine("ended", "TST");
    assertExpandedLine(
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
    const expandedLines = macroProcessor.lines(tokenised).toArray();
    assertEquals(expandedLines.length, testLines.length);
    for (const [index, expanded] of expandedLines.entries()) {
        assertEquals(expanded.macroName, noMacroName);
        assertEquals(expanded.mnemonic, testLines[index]![1]);
    }
});
