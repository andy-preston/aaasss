import { assertEquals } from "assert";
import { assertFailureWithExtra } from "../failure/testing.ts";
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
    const lines = environment.fileStack.lines();
    lines.next();

    environment.macros.macro("plop");
    environment.macros.lines(testLine("testLabel", "TST", [])).toArray();
    environment.macros.lines(testLine("",          "AND", [])).toArray();
    environment.macros.lines(testLine("",          "TST", [])).toArray();
    environment.macros.end();
    environment.macros.lines(testLine("",          "", [])).toArray();

    environment.jsExpression("plop();");
    assertEquals(lines.next().value!.rawSource, "plop$1$testLabel: TST");
    assertEquals(lines.next().value!.rawSource,                   "AND");
    assertEquals(lines.next().value!.rawSource,                   "TST");
});

Deno.test("on play-back, parameters are substituted", () => {
    const environment = testEnvironment();
    const lines = environment.fileStack.lines();
    lines.next();

    environment.macros.macro("plop", ["p1", "p2"]);
    environment.macros.lines(testLine("", "TST", ["p1"])).toArray();
    environment.macros.lines(testLine("", "AND", ["R15"])).toArray();
    environment.macros.lines(testLine("", "TST", ["p2"])).toArray();
    environment.macros.end();
    environment.macros.lines(testLine("", "",    [])).toArray();

    environment.jsExpression("plop(4, 'test');");
    assertEquals(lines.next().value!.rawSource, "TST 4");
    assertEquals(lines.next().value!.rawSource, "AND R15");
    assertEquals(lines.next().value!.rawSource, "TST test");
});

Deno.test("Parameter count mismatches result in a failure", () => {
    const environment = testEnvironment();
    const lines = environment.fileStack.lines();
    lines.next();

    const expectedParameters = ["p1", "p2"]
    environment.macros.macro("plop", expectedParameters);
    environment.macros.lines(testLine("", "TST", ["p1", "p2"])).toArray();
    environment.macros.end();
    environment.macros.lines(testLine("", "",    [])).toArray();

    assertFailureWithExtra(
        environment.jsExpression("plop('MATCHED');"),
        "macro_params",
        `${expectedParameters.length}`
    );
});

Deno.test("Labels are mapped on each successive usage", () => {
    const environment = testEnvironment();
    const lines = environment.fileStack.lines();
    lines.next();

    environment.macros.macro("plop");
    environment.macros.lines(testLine("",      "JMP", ["label"])).toArray();
    environment.macros.lines(testLine("label", "TST", [])).toArray();
    environment.macros.lines(testLine("",      "JMP", ["label"])).toArray();
    environment.macros.end();
    environment.macros.lines(testLine("",      "",    [])).toArray();

    environment.jsExpression("plop();");
    assertEquals(lines.next().value!.rawSource, "JMP plop$1$label");
    assertEquals(lines.next().value!.rawSource, "plop$1$label: TST");
    assertEquals(lines.next().value!.rawSource, "JMP plop$1$label");
});

Deno.test("External labels remain unmapped", () => {
    const environment = testEnvironment();
    const lines = environment.fileStack.lines();
    lines.next();

    environment.macros.macro("plop");
    environment.macros.lines(testLine("",      "JMP", ["externalLabel"])).toArray();
    environment.macros.lines(testLine("label", "TST", [])).toArray();
    environment.macros.lines(testLine("",      "JMP", ["externalLabel"])).toArray();
    environment.macros.end();
    environment.macros.lines(testLine("",      "",    [])).toArray();

    environment.jsExpression("plop();");
    assertEquals(lines.next().value!.rawSource, "JMP externalLabel");
    assertEquals(lines.next().value!.rawSource, "plop$1$label: TST");
    assertEquals(lines.next().value!.rawSource, "JMP externalLabel");
});

Deno.test("Multiple macro invocations have higher index in label mappings", () => {
    const environment = testEnvironment();
    const lines = environment.fileStack.lines();
    lines.next();

    environment.macros.macro("plop");
    environment.macros.lines(testLine("",      "JMP", ["label"])).toArray();
    environment.macros.lines(testLine("label", "TST", [])).toArray();
    environment.macros.lines(testLine("",      "JMP", ["label"])).toArray();
    environment.macros.end();
    environment.macros.lines(testLine("",      "",    [])).toArray();

    for (const invocation of [1, 2, 3]) {
        environment.jsExpression("plop();");
        const expectedLabel = `plop$${invocation}$label`;
        assertEquals(lines.next().value!.rawSource, `JMP ${expectedLabel}`);
        assertEquals(lines.next().value!.rawSource, `${expectedLabel}: TST`);
        assertEquals(lines.next().value!.rawSource, `JMP ${expectedLabel}`);
    }
});
