import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";
import { emptyLine } from "../line/line-types.ts";

Deno.test("The symbol table is reset at the end of the first pass", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.persistentSymbol("plop", 57);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    [1, 2, 3].forEach(expectedCount => {
        const use = systemUnderTest.symbolTable.use("plop");
        expect(use).toEqual(57);
        expect(systemUnderTest.symbolTable.count("plop")).toBe(expectedCount);
    });
    systemUnderTest.currentLine(emptyLine("plop.asm"));
    systemUnderTest.symbolTable.reset(1);
    expect(systemUnderTest.symbolTable.count("plop")).toEqual(0);
});

Deno.test("... but left intact at the end of the second pass", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.persistentSymbol("plop", 57);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    [1, 2, 3].forEach(expectedCount => {
        const use = systemUnderTest.symbolTable.use("plop");
        expect(use).toEqual(57);
        expect(systemUnderTest.symbolTable.count("plop")).toBe(expectedCount);
    });
    systemUnderTest.currentLine(emptyLine("plop.asm"));
    systemUnderTest.symbolTable.reset(2);
    expect(systemUnderTest.symbolTable.count("plop")).toEqual(3);
});
