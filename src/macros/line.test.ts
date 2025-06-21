import type { BaggedDirective } from "../directives/bags.ts";

import { expect } from "jsr:@std/expect";
import { emptyLine } from "../line/line-types.ts";
import { testSystem } from "./testing.ts";

const testLines: Array<[string, string, string]> = [
    ["testLabel: TST", "testLabel", "TST"],
    ["testLabel: AND", "testLabel", "AND"],
    ["           TST", "",          "TST"]
] as const;

Deno.test("Most of the time, lines will just be passed on to the next stage", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");
    testLines.forEach(([source, label, mnemonic]) => {
        systemUnderTest.currentLine(emptyLine("plop.asm"));
        systemUnderTest.currentLine().rawSource = source;
        systemUnderTest.currentLine().assemblySource = source;
        systemUnderTest.currentLine().label = label;
        systemUnderTest.currentLine().mnemonic = mnemonic;
        systemUnderTest.macros.processedLine();
        expect(systemUnderTest.currentLine().isDefiningMacro).toBe(false);
        expect(systemUnderTest.currentLine().macroName).toBe("");
        expect(systemUnderTest.currentLine().macroCount).toBe(0);
        expect(systemUnderTest.currentLine().label).toBe(label);
    });
});

Deno.test("Once a macro has been recorded, it can be played-back", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");

    systemUnderTest.macros.define("testMacro", []);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    testLines.forEach(([source, label, mnemonic]) => {
        systemUnderTest.currentLine(emptyLine("plop.asm"));
        systemUnderTest.currentLine().rawSource = source;
        systemUnderTest.currentLine().assemblySource = source;
        systemUnderTest.currentLine().label = label;
        systemUnderTest.currentLine().mnemonic = mnemonic;
        systemUnderTest.macros.processedLine();
    });
    systemUnderTest.macros.end();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);

    systemUnderTest.macros.use("testMacro", []);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    let index = 0;
    systemUnderTest.fileStack.lines(() => {
        expect(
            systemUnderTest.currentLine().rawSource
        ).toBe(
            testLines[index]![0]
        );
        index = index + 1;
    }, () => {});
    expect(index).toBe(3);
});

Deno.test("Lines that are being replayed have a macro name and count", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");

    systemUnderTest.macros.define("testMacro", []);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    testLines.forEach(([source, label, mnemonic]) => {
        systemUnderTest.currentLine(emptyLine("plop.asm"));
        systemUnderTest.currentLine().rawSource = source;
        systemUnderTest.currentLine().assemblySource = source;
        systemUnderTest.currentLine().label = label;
        systemUnderTest.currentLine().mnemonic = mnemonic;
        systemUnderTest.macros.processedLine();
    });
    systemUnderTest.macros.end();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    const forceSymbolIncrement = systemUnderTest.symbolTable.use("testMacro");
    expect((forceSymbolIncrement as BaggedDirective).type).toBe(
        "functionUseDirective"
    );

    systemUnderTest.macros.use("testMacro", []);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    let index = 0;
    systemUnderTest.fileStack.lines(() => {
        expect(systemUnderTest.currentLine().macroName).toBe("testMacro");
        expect(systemUnderTest.currentLine().macroCount).toBe(1);
        index = index + 1;
    }, () => {});
    expect(index).toBe(3);
});
