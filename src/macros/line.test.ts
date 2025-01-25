import { assertEquals, assertFalse } from "assert";
import type { Label, Mnemonic } from "../source-code/data-types.ts";
import type { LineWithProcessedMacro } from "./line-types.ts";
import { macros } from "./macros.ts";
import { testLine } from "./testing.ts";

const assertProcessedLine = (
    lines: Array<LineWithProcessedMacro>,
    expectedRecording: boolean,
    expectedLabel: Label,
    expectedMnemonic: Mnemonic
) => {
    assertEquals(lines.length, 1);
    const line = lines[0]!;
    assertEquals(line.isRecordingMacro, expectedRecording);
    assertEquals(line.label, expectedLabel);
    assertEquals(line.mnemonic, expectedMnemonic);
};

Deno.test("Most of the time, lines will just be passed on to the next stage", () => {
    const macroProcessor = macros();
    const testLines = [["testLabel", "TST"], ["", "AND"], ["", "TST"]];
    for (const [label, mnemonic] of testLines) {
        const tokenised = testLine(label!, mnemonic!, []);
        assertProcessedLine(
            macroProcessor.lines(tokenised).toArray(),
            false, label!, mnemonic!
        );
    }
});

Deno.test("Whilst a macro is being defined, saveLine will... save lines", () => {
    const macroProcessor = macros();
    macroProcessor.macro("plop");

    const testLines = [["testLabel", "TST"], ["", "AND"], ["", "TST"]];
    for (const [label, mnemonic] of testLines) {
        const tokenised = testLine(label!, mnemonic!, []);
        const processed = macroProcessor.lines(tokenised).toArray();
        assertProcessedLine(processed, true, label!, mnemonic!);
    }
    macroProcessor.end();

    const tokenised = testLine("ended", "TST", []);
    assertProcessedLine(
        macroProcessor.lines(tokenised).toArray(),
        false, "ended", "TST"
    );
});

Deno.test("Once a macro has been recorded, it can be played-back", () => {
    const macroProcessor = macros();

    macroProcessor.macro("plop");
    const testLines: Array<[Label, Mnemonic]> = [
        ["testLabel", "TST"],
        ["", "AND"],
        ["", "TST"]
    ];
    for (const [label, mnemonic] of testLines) {
        macroProcessor.lines(testLine(label, mnemonic, [])).toArray();
    }
    macroProcessor.end();

    macroProcessor.useMacro("plop", []);
    testLines.unshift(["ended", ""]);
    let index = 0;
    const lines = macroProcessor.lines(testLine("ended", "", []));
    for (const line of lines) {
        assertFalse(line.isRecordingMacro);
        assertEquals(line.mnemonic, testLines[index]![1]);
        index = index + 1;
    }
    assertEquals(index, testLines.length);
});

Deno.test("on play-back, parameters are substituted", () => {
    const macroProcessor = macros();

    macroProcessor.macro("plop", ["p1", "p2"]);
    macroProcessor.lines(testLine("", "TST", ["p1"])).toArray();
    macroProcessor.lines(testLine("", "AND", ["R15"])).toArray();
    macroProcessor.lines(testLine("", "TST", ["p2"])).toArray();
    macroProcessor.end();

    macroProcessor.useMacro("plop", [4, "test"]);
    const lines = macroProcessor.lines(testLine("", "", []));
    const _dummy = lines.next().value!;

    const first = lines.next().value!;
    assertEquals(first.mnemonic, "TST");
    assertEquals(first.symbolicOperands, ["4"]);

    const second = lines.next().value!;
    assertEquals(second.mnemonic, "AND");
    assertEquals(second.symbolicOperands, ["R15"]);

    const third = lines.next().value!;
    assertEquals(third.mnemonic, "TST");
    assertEquals(third.symbolicOperands, ["test"]);
});

Deno.test("It still tries it's best to map mismatched parameters", () => {
    const macroProcessor = macros();

    macroProcessor.macro("plop", ["willMatch", "wontMatch"]);
    macroProcessor.lines(testLine("", "TST", ["willMatch"])).toArray();
    macroProcessor.lines(testLine("", "AND", ["R15"])).toArray();
    macroProcessor.lines(testLine("", "TST", ["wontMatch"])).toArray();
    macroProcessor.end();

    macroProcessor.useMacro("plop", ["MATCHED"]);
    const lines = macroProcessor.lines(testLine("", "", []));
    const _dummy = lines.next().value!;

    const first = lines.next().value!;
    assertEquals(first.mnemonic, "TST");
    assertEquals(first.symbolicOperands, ["MATCHED"]);

    const second = lines.next().value!;
    assertEquals(second.mnemonic, "AND");
    assertEquals(second.symbolicOperands, ["R15"]);

    const third = lines.next().value!;
    assertEquals(third.mnemonic, "TST");
    assertEquals(third.symbolicOperands, ["wontMatch"]);
});

Deno.test("Labels are mapped on each successive usage", () => {
    const macroProcessor = macros();

    macroProcessor.macro("plop");
    macroProcessor.lines(testLine("",      "JMP", ["label"])).toArray();
    macroProcessor.lines(testLine("label", "TST", [])).toArray();
    macroProcessor.lines(testLine("",      "JMP", ["label"])).toArray();
    macroProcessor.end();

    macroProcessor.useMacro("plop");
    const lines = macroProcessor.lines(testLine("", "", []));
    const _dummy = lines.next().value!;

    const first = lines.next().value!;
    assertEquals(first.mnemonic, "JMP");
    assertEquals(first.symbolicOperands, ["plop$1$label"]);

    const second = lines.next().value!;
    assertEquals(second.label, "plop$1$label");
    assertEquals(second.mnemonic, "TST");
    assertEquals(second.symbolicOperands, []);

    const third = lines.next().value!;
    assertEquals(third.mnemonic, "JMP");
    assertEquals(third.symbolicOperands, ["plop$1$label"]);
});

Deno.test("External labels remain unmapped", () => {
    const macroProcessor = macros();

    macroProcessor.macro("plop");
    macroProcessor.lines(testLine("",      "JMP", ["externalLabel"])).toArray();
    macroProcessor.lines(testLine("label", "TST", [])).toArray();
    macroProcessor.lines(testLine("",      "JMP", ["externalLabel"])).toArray();
    macroProcessor.end();

    macroProcessor.useMacro("plop");
    const lines = macroProcessor.lines(testLine("", "", []));
    const _dummy = lines.next().value!;

    const first = lines.next().value!;
    assertEquals(first.mnemonic, "JMP");
    assertEquals(first.symbolicOperands, ["externalLabel"]);

    const second = lines.next().value!;
    assertEquals(second.label, "plop$1$label");
    assertEquals(second.mnemonic, "TST");
    assertEquals(second.symbolicOperands, []);

    const third = lines.next().value!;
    assertEquals(third.mnemonic, "JMP");
    assertEquals(third.symbolicOperands, ["externalLabel"]);
});

Deno.test("Multiple macro invocations have higher index in label mappings", () => {
    const macroProcessor = macros();

    macroProcessor.macro("plop");
    macroProcessor.lines(testLine("",      "JMP", ["label"])).toArray();
    macroProcessor.lines(testLine("label", "TST", [])).toArray();
    macroProcessor.lines(testLine("",      "JMP", ["label"])).toArray();
    macroProcessor.end();

    for (const invocation of [1, 2, 3]) {
        const expectedLabel = `plop$${invocation}$label`;
        macroProcessor.useMacro("plop");
        const lines = macroProcessor.lines(testLine("", "", []));
        const _dummy = lines.next().value!;

        const first = lines.next().value!;
        assertEquals(first.mnemonic, "JMP");
        assertEquals(first.symbolicOperands, [expectedLabel]);

        const second = lines.next().value!;
        assertEquals(second.label, expectedLabel);
        assertEquals(second.mnemonic, "TST");
        assertEquals(second.symbolicOperands, []);

        const third = lines.next().value!;
        assertEquals(third.mnemonic, "JMP");
        assertEquals(third.symbolicOperands, [expectedLabel]);
    }
});
