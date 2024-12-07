import { assertEquals } from "assert";
import { assemblyLine, rawLine } from "../source-code/line-types.ts";
import { tokenisedLine, type TokenisedLine } from "../tokenise/tokenised-line.ts";
import { processor } from "./processor.ts";
import { Label, Mnemonic } from "../source-code/data-types.ts";

const testLine = (label: string, mnemonic: string) => {
    const raw = rawLine("", 0, "", []);
    const assembly = assemblyLine(raw, "", []);
    return tokenisedLine(assembly, label, mnemonic, [], []);
};

Deno.test("Whilst a macro is being defined, saveLine will... save lines", () => {
    const macroProcessor = processor();

    const assertExpandedLine = (
        tokenised: TokenisedLine,
        expectedName: string,
        expectedLabel: Label,
        expectedMnemonic: Mnemonic
    ) => {
        const expandedLines = macroProcessor.lines(tokenised).toArray();
        assertEquals(expandedLines.length, 1);
        const expanded = expandedLines[0]!;
        assertEquals(expanded.macroName, expectedName);
        assertEquals(expanded.label, expectedLabel);
        assertEquals(expanded.mnemonic, expectedMnemonic);
    }

    const noMacroName = "";

    macroProcessor.defineDirective("plop");
    const testLines = [["testLabel", "TST"], ["", "AND"], ["", "TST"]];
    for (const [label, mnemonic] of testLines) {
        assertExpandedLine(
            testLine(label!, mnemonic!),
            "plop", label!, mnemonic!
        );
    }
    macroProcessor.endDirective();
    assertExpandedLine(
        testLine("ended", "TST"),
        noMacroName, "ended", "TST"
    );
});
