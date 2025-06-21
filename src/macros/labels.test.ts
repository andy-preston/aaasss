import { expect } from "jsr:@std/expect";
import { emptyLine } from "../line/line-types.ts";
import { testSystem } from "./testing.ts";

Deno.test("Labels in macro operands are expanded on each invocation", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");

    systemUnderTest.macros.define("testMacro", []);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    systemUnderTest.currentLine().label = "aLabel";
    systemUnderTest.macros.processedLine();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    systemUnderTest.macros.end();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    systemUnderTest.macros.use("testMacro", []);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);

    systemUnderTest.currentLine(emptyLine("plop.asm"));
    systemUnderTest.currentLine().label = "aLabel";
    systemUnderTest.currentLine().macroName = "testMacro";
    systemUnderTest.currentLine().macroCount = 2;
    systemUnderTest.currentLine().rawSource = "JMP aLabel";
    systemUnderTest.currentLine().assemblySource = "JMP aLabel";
    systemUnderTest.currentLine().mnemonic = "JMP";
    systemUnderTest.currentLine().operands = ["aLabel"];
    systemUnderTest.macros.processedLine();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.currentLine().operands[0]).toBe("testMacro$2$aLabel");
});

Deno.test("But label operands from outside the macro are left as is", () => {
    const systemUnderTest = testSystem(() => [], "plop.asm");
    systemUnderTest.macros.define("testMacro", []);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    systemUnderTest.currentLine().label = "aLabel";
    systemUnderTest.macros.processedLine();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    systemUnderTest.macros.end();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    systemUnderTest.macros.use("testMacro", []);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);

    systemUnderTest.currentLine(emptyLine("plop.asm"));
    systemUnderTest.currentLine().macroName = "testMacro";
    systemUnderTest.currentLine().macroCount = 3;
    systemUnderTest.currentLine().rawSource = "JMP aDifferentLabel";
    systemUnderTest.currentLine().mnemonic = "JMP";
    systemUnderTest.currentLine().operands = ["aDifferentLabel"];
    systemUnderTest.macros.processedLine();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.currentLine().operands[0]).toBe("aDifferentLabel");
});

Deno.test("Actual labels in macros are also expanded on playback", () => {
    const macroName = "testMacro";
    const macroCount = 4;
    const plainLabel = "aLabel";
    const expandedLabel = `${macroName}$${macroCount}$${plainLabel}`;
    const systemUnderTest = testSystem(() => [], "plop.asm");

    systemUnderTest.macros.define("testMacro", []);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);

    systemUnderTest.currentLine().label = plainLabel;
    systemUnderTest.macros.processedLine();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    systemUnderTest.currentLine(emptyLine("plop.asm"));

    systemUnderTest.macros.end();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);

    systemUnderTest.macros.use("testMacro", []);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);

    systemUnderTest.currentLine().macroName = macroName;
    systemUnderTest.currentLine().macroCount = macroCount;
    systemUnderTest.currentLine().label = plainLabel;
    systemUnderTest.currentLine().mnemonic = "RJMP";
    systemUnderTest.currentLine().operands = [plainLabel];
    systemUnderTest.macros.processedLine();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.currentLine().label).toBe(expandedLabel);
    expect(systemUnderTest.currentLine().operands[0]).toBe(expandedLabel);
});
