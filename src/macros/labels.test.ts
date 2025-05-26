import { expect } from "jsr:@std/expect";
import { dummyLine } from "../line/line-types.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("Labels in macro operands are expanded on each invocation", () => {
    const system = systemUnderTest();
    const define = system.macros.define("testMacro", []);
    expect(define.type).not.toBe("failures");
    {
        const line = dummyLine(false);
        line.label = "aLabel";
        system.macros.processedLine(line);
        expect(line.failed()).toBe(false);
    }
    const end = system.macros.end();
    expect(end.type).not.toBe("failures");
    const use = system.macros.use("testMacro", []);
    expect(use.type).not.toBe("failures");
    {
        const line = dummyLine(false);
        line.macroName = "testMacro";
        line.macroCount = 2;
        line.rawSource = "JMP aLabel";
        line.mnemonic = "JMP";
        line.symbolicOperands = ["aLabel"];
        system.macros.processedLine(line);
        expect(line.failed()).toBe(false);
        expect(line.symbolicOperands[0]).toBe("testMacro$2$aLabel");
    }
});

Deno.test("But label operands from outside the macro are left as is", () => {
    const system = systemUnderTest();
    const define = system.macros.define("testMacro", []);
    expect(define.type).not.toBe("failures");
    {
        const line = dummyLine(false);
        line.label = "aLabel";
        system.macros.processedLine(line);
        expect(line.failed()).toBe(false);
    }
    const end = system.macros.end();
    expect(end.type).not.toBe("failures");
    const use = system.macros.use("testMacro", []);
    expect(use.type).not.toBe("failures");
    {
        const line = dummyLine(false);
        line.macroName = "testMacro";
        line.macroCount = 3;
        line.rawSource = "JMP aDifferentLabel";
        line.mnemonic = "JMP";
        line.symbolicOperands = ["aDifferentLabel"];
        system.macros.processedLine(line);
        expect(line.failed()).toBe(false);
        expect(line.symbolicOperands[0]).toBe("aDifferentLabel");
    }
});

Deno.test("Actual labels in macros are also expanded on playback", () => {
    const system = systemUnderTest();
    const define = system.macros.define("testMacro", []);
    expect(define.type).not.toBe("failures");
    const end = system.macros.end();
    expect(end.type).not.toBe("failures");
    const use = system.macros.use("testMacro", []);
    expect(use.type).not.toBe("failures");
    {
        const line = dummyLine(false);
        line.macroName = "testMacro";
        line.macroCount = 4;
        line.label = "aLabel";
        line.mnemonic = "TST";
        system.macros.processedLine(line);
        expect(line.failed()).toBe(false);
        expect(line.label).toBe(`testMacro$4$aLabel`);
    }
});
