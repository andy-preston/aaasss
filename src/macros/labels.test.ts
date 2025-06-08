import { expect } from "jsr:@std/expect";
import { dummyLine } from "../line/line-types.ts";
import { testSystem } from "./testing.ts";

Deno.test("Labels in macro operands are expanded on each invocation", () => {
    const systemUnderTest = testSystem();
    const define = systemUnderTest.macros.define("testMacro", []);
    expect(define.type).not.toBe("failures");
    {
        const line = dummyLine(false, 1);
        line.label = "aLabel";
        systemUnderTest.macros.processedLine(line);
        expect(line.failed()).toBe(false);
    }
    const end = systemUnderTest.macros.end();
    expect(end.type).not.toBe("failures");
    const use = systemUnderTest.macros.use("testMacro", []);
    expect(use.type).not.toBe("failures");
    {
        const line = dummyLine(false, 1);
        line.macroName = "testMacro";
        line.macroCount = 2;
        line.rawSource = "JMP aLabel";
        line.mnemonic = "JMP";
        line.symbolicOperands = ["aLabel"];
        systemUnderTest.macros.processedLine(line);
        expect(line.failed()).toBe(false);
        expect(line.symbolicOperands[0]).toBe("testMacro$2$aLabel");
    }
});

Deno.test("But label operands from outside the macro are left as is", () => {
    const systemUnderTest = testSystem();
    const define = systemUnderTest.macros.define("testMacro", []);
    expect(define.type).not.toBe("failures");
    {
        const line = dummyLine(false, 1);
        line.label = "aLabel";
        systemUnderTest.macros.processedLine(line);
        expect(line.failed()).toBe(false);
    }
    const end = systemUnderTest.macros.end();
    expect(end.type).not.toBe("failures");
    const use = systemUnderTest.macros.use("testMacro", []);
    expect(use.type).not.toBe("failures");
    {
        const line = dummyLine(false, 1);
        line.macroName = "testMacro";
        line.macroCount = 3;
        line.rawSource = "JMP aDifferentLabel";
        line.mnemonic = "JMP";
        line.symbolicOperands = ["aDifferentLabel"];
        systemUnderTest.macros.processedLine(line);
        expect(line.failed()).toBe(false);
        expect(line.symbolicOperands[0]).toBe("aDifferentLabel");
    }
});

Deno.test("Actual labels in macros are also expanded on playback", () => {
    const systemUnderTest = testSystem();
    const define = systemUnderTest.macros.define("testMacro", []);
    expect(define.type).not.toBe("failures");
    const end = systemUnderTest.macros.end();
    expect(end.type).not.toBe("failures");
    const use = systemUnderTest.macros.use("testMacro", []);
    expect(use.type).not.toBe("failures");
    {
        const line = dummyLine(false, 1);
        line.macroName = "testMacro";
        line.macroCount = 4;
        line.label = "aLabel";
        line.mnemonic = "TST";
        systemUnderTest.macros.processedLine(line);
        expect(line.failed()).toBe(false);
        expect(line.label).toBe(`testMacro$4$aLabel`);
    }
});
