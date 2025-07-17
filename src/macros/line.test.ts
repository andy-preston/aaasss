import { expect } from "jsr:@std/expect";
import { isFunction } from "../directives/testing.ts";
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
        expect(systemUnderTest.currentLine().macroName).toBe("");
        expect(systemUnderTest.currentLine().macroCount).toBe(0);
        expect(systemUnderTest.currentLine().label).toBe(label);
    });
});

Deno.test("Once a macro has been recorded, it can be played-back", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");
    const macro = systemUnderTest.symbolTable.use("macro");
    const end = systemUnderTest.symbolTable.use("end");

    if (isFunction(macro)) {
        macro("testMacro");
    }
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    testLines.forEach(([source, label, mnemonic]) => {
        systemUnderTest.currentLine(emptyLine("plop.asm"));
        systemUnderTest.currentLine().rawSource = source;
        systemUnderTest.currentLine().assemblySource = source;
        systemUnderTest.currentLine().label = label;
        systemUnderTest.currentLine().mnemonic = mnemonic;
        systemUnderTest.macros.processedLine();
    });
    if (isFunction(end)) {
        end();
    }
    expect(systemUnderTest.currentLine().failures).toEqual([]);

    const testMacro = systemUnderTest.symbolTable.use("testMacro");
    if (isFunction(testMacro)) {
        testMacro();
    }
    expect(systemUnderTest.currentLine().failures).toEqual([]);
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
    const macro = systemUnderTest.symbolTable.use("macro");
    const end = systemUnderTest.symbolTable.use("end");

    if (isFunction(macro)) {
        macro("testMacro");
    }
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    testLines.forEach(([source, label, mnemonic]) => {
        systemUnderTest.currentLine(emptyLine("plop.asm"));
        systemUnderTest.currentLine().rawSource = source;
        systemUnderTest.currentLine().assemblySource = source;
        systemUnderTest.currentLine().label = label;
        systemUnderTest.currentLine().mnemonic = mnemonic;
        systemUnderTest.macros.processedLine();
    });
    if (isFunction(end)) {
        end();
    }
    expect(systemUnderTest.currentLine().failures).toEqual([]);

    const testMacro = systemUnderTest.symbolTable.use("testMacro");
    if (isFunction(testMacro)) {
        testMacro();
    }
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    let index = 0;
    systemUnderTest.fileStack.lines(() => {
        expect(systemUnderTest.currentLine().macroName).toBe("testMacro");
        expect(systemUnderTest.currentLine().macroCount).toBe(1);
        index = index + 1;
    }, () => {});
    expect(index).toBe(3);
});
