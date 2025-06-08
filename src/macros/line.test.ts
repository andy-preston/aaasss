import { expect } from "jsr:@std/expect";
import { dummyLine } from "../line/line-types.ts";
import { testSystem } from "./testing.ts";

const testLines: Array<[string, string, string]> = [
    ["testLabel: TST", "testLabel", "TST"],
    ["testLabel: AND", "testLabel", "AND"],
    ["           TST", "",          "TST"]
] as const;

Deno.test("Most of the time, lines will just be passed on to the next stage", () => {
    const systemUnderTest = testSystem();
    testLines.forEach(([source, label, mnemonic]) => {
        const line = dummyLine(false, 1);
        line.rawSource = source;
        line.assemblySource = source;
        line.label = label;
        line.mnemonic = mnemonic;
        systemUnderTest.macros.processedLine(line);
        expect(line.isDefiningMacro).toBe(false);
        expect(line.macroName).toBe("");
        expect(line.macroCount).toBe(0);
        expect(line.label).toBe(label);
    });
});

Deno.test("Whilst a macro is being defined, the isRecording flag is set", () => {
    const systemUnderTest = testSystem();
    const define = systemUnderTest.macros.define("testMacro", []);
    expect(define.type).not.toBe("failures");
    testLines.forEach(([source, label, mnemonic]) => {
        const line = dummyLine(false, 1);
        line.rawSource = source;
        line.assemblySource = source;
        line.label = label;
        line.mnemonic = mnemonic;
        systemUnderTest.macros.processedLine(line);
        expect(line.isDefiningMacro).toBe(true);
    });
    const end = systemUnderTest.macros.end();
    expect(end.type).not.toBe("failures");
    testLines.forEach(([source, label, mnemonic]) => {
        const line = dummyLine(false, 1);
        line.rawSource = source;
        line.assemblySource = source;
        line.label = label;
        line.mnemonic = mnemonic;
        systemUnderTest.macros.processedLine(line);
        expect(line.isDefiningMacro).toBe(false);
    });
});

Deno.test("Once a macro has been recorded, it can be played-back", () => {
    const systemUnderTest = testSystem();

    const define = systemUnderTest.macros.define("testMacro", []);
    expect(define.type).not.toBe("failures");
    testLines.forEach(([source, label, mnemonic]) => {
        const line = dummyLine(false, 1);
        line.rawSource = source;
        line.assemblySource = source;
        line.label = label;
        line.mnemonic = mnemonic;
        systemUnderTest.macros.processedLine(line);
    });
    const end = systemUnderTest.macros.end();
    expect(end.type).not.toBe("failures");

    const use = systemUnderTest.macros.use("testMacro", []);
    expect(use.type).not.toBe("failures");
    const playback = [...systemUnderTest.mockFileStack.lines(1)];
    expect(playback.length).toBe(testLines.length);
    playback.forEach((line, index) => {
        systemUnderTest.macros.processedLine(line);
        expect(line.rawSource).toBe(testLines[index]![0]);
    });
});

Deno.test("Lines that are being replayed have a macro name and count", () => {
    const systemUnderTest = testSystem();

    const define = systemUnderTest.macros.define("testMacro", []);
    expect(define.type).not.toBe("failures");
    testLines.forEach(([source, label, mnemonic]) => {
        const line = dummyLine(false, 1);
        line.rawSource = source;
        line.assemblySource = source;
        line.label = label;
        line.mnemonic = mnemonic;
        systemUnderTest.macros.processedLine(line);
    });
    const end = systemUnderTest.macros.end();
    expect(end.type).not.toBe("failures");

    const forceSymbolIncrement = systemUnderTest.symbolTable.use("testMacro");
    expect(forceSymbolIncrement.type).toBe("functionUseDirective");

    const use = systemUnderTest.macros.use("testMacro", []);
    expect(use.type).not.toBe("failures");
    const playback = [...systemUnderTest.mockFileStack.lines(1)];
    expect(playback.length).toBe(testLines.length);
    playback.forEach(line => {
        systemUnderTest.macros.processedLine(line);
        expect(line.macroName).toBe("testMacro");
        expect(line.macroCount).toBe(1);
    });
});
