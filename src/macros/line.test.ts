import { assert, assertEquals, assertFalse } from "assert";
import type { Label, Mnemonic } from "../tokens/data-types.ts";
import type { LineWithProcessedMacro } from "./line-types.ts";
import { testEnvironment, testLine } from "./testing.ts";

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
    const environment = testEnvironment();
    const testLines = [["testLabel", "TST"], ["", "AND"], ["", "TST"]];
    for (const [label, mnemonic] of testLines) {
        const tokenised = testLine(label!, mnemonic!, []);
        assertProcessedLine(
            environment.macros.lines(tokenised).toArray(),
            false, label!, mnemonic!
        );
    }
});

Deno.test("Whilst a macro is being defined, saveLine will... save lines", () => {
    const environment = testEnvironment();

    environment.macros.macro("plop");
    environment.macros.lines(testLine("testLabel", "TST", [])).toArray();
    environment.macros.lines(testLine("",          "AND", [])).toArray();
    environment.macros.lines(testLine("",          "TST", [])).toArray();
    environment.macros.end();
    environment.macros.lines(testLine("",          "", [])).toArray();

    const tokenised = testLine("ended", "TST", []);
    assertProcessedLine(
        environment.macros.lines(tokenised).toArray(),
        false, "ended", "TST"
    );
});

Deno.test("Once a macro has been recorded, it can be played-back", () => {
    const environment = testEnvironment();

    environment.macros.macro("plop");
    environment.macros.lines(testLine("testLabel", "TST", [])).toArray();
    environment.macros.lines(testLine("",          "AND", [])).toArray();
    environment.macros.lines(testLine("",          "TST", [])).toArray();
    environment.macros.end();
    environment.macros.lines(testLine("",          "", [])).toArray();

    environment.jsExpression("plop();")
    const lines = environment.macros.lines(testLine("", "", []));
    assertFalse(lines.next().done);

    const first = lines.next().value!;
    assertFalse(first.isRecordingMacro)
    assertEquals(first.mnemonic, "TST");

    const second = lines.next().value!;
    assertFalse(second.isRecordingMacro)
    assertEquals(second.mnemonic, "AND");

    const third = lines.next().value!;
    assertFalse(third.isRecordingMacro)
    assertEquals(third.mnemonic, "TST");

    const fourth = lines.next().value!;
    assertFalse(fourth.isRecordingMacro)
    assertEquals(fourth.mnemonic, "");

    assert(lines.next().done);
});

Deno.test("on play-back, parameters are substituted", () => {
    const environment = testEnvironment();

    environment.macros.macro("plop", ["p1", "p2"]);
    environment.macros.lines(testLine("", "TST", ["p1"])).toArray();
    environment.macros.lines(testLine("", "AND", ["R15"])).toArray();
    environment.macros.lines(testLine("", "TST", ["p2"])).toArray();
    environment.macros.end();
    environment.macros.lines(testLine("", "",    [])).toArray();

    environment.jsExpression("plop(4, 'test');");
    const lines = environment.macros.lines(testLine("", "", []));
    assertFalse(lines.next().done);

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
    const environment = testEnvironment();

    environment.macros.macro("plop", ["willMatch", "wontMatch"]);
    environment.macros.lines(testLine("", "TST", ["willMatch"])).toArray();
    environment.macros.lines(testLine("", "AND", ["R15"])).toArray();
    environment.macros.lines(testLine("", "TST", ["wontMatch"])).toArray();
    environment.macros.end();
    environment.macros.lines(testLine("", "",    [])).toArray();

    environment.jsExpression("plop('MATCHED');");
    const lines = environment.macros.lines(testLine("", "", []));
    assertFalse(lines.next().done);

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
    const environment = testEnvironment();

    environment.macros.macro("plop");
    environment.macros.lines(testLine("",      "JMP", ["label"])).toArray();
    environment.macros.lines(testLine("label", "TST", [])).toArray();
    environment.macros.lines(testLine("",      "JMP", ["label"])).toArray();
    environment.macros.end();
    environment.macros.lines(testLine("",      "",    [])).toArray();

    environment.jsExpression("plop();");
    const lines = environment.macros.lines(testLine("", "", []));
    assertFalse(lines.next().done);

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
    const environment = testEnvironment();

    environment.macros.macro("plop");
    environment.macros.lines(testLine("",      "JMP", ["externalLabel"])).toArray();
    environment.macros.lines(testLine("label", "TST", [])).toArray();
    environment.macros.lines(testLine("",      "JMP", ["externalLabel"])).toArray();
    environment.macros.end();
    environment.macros.lines(testLine("",      "",    [])).toArray();

    environment.jsExpression("plop();");
    const lines = environment.macros.lines(testLine("", "", []));
    assertFalse(lines.next().done);

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
    const environment = testEnvironment();

    environment.macros.macro("plop");
    environment.macros.lines(testLine("",      "JMP", ["label"])).toArray();
    environment.macros.lines(testLine("label", "TST", [])).toArray();
    environment.macros.lines(testLine("",      "JMP", ["label"])).toArray();
    environment.macros.end();
    environment.macros.lines(testLine("",      "",    [])).toArray();

    for (const invocation of [1, 2, 3]) {
        const expectedLabel = `plop$${invocation}$label`;
        environment.jsExpression("plop();");
        const lines = environment.macros.lines(testLine("", "", []));
        assertFalse(lines.next().done);

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
