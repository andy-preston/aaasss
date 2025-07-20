import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("Leading and trailing whitespace is discarded", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "\tLDI R16, 23   ";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().label).toBe("");
    expect(systemUnderTest.currentLine().mnemonic).toBe("LDI");
    expect(systemUnderTest.currentLine().operands).toEqual(["R16", "23"]);
});

Deno.test("Lines could be entirely blank", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().label).toBe("");
    expect(systemUnderTest.currentLine().mnemonic).toBe("");
    expect(systemUnderTest.currentLine().operands).toEqual([]);
});

Deno.test("Multiple spaces are reduced to one space", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "LDI     R16, \t 23";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().label).toBe("");
    expect(systemUnderTest.currentLine().mnemonic).toBe("LDI");
    expect(systemUnderTest.currentLine().operands).toEqual(["R16", "23"]);
});

Deno.test("Comments are stripped and discarded", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "LDI R16, 23 ; Put 16 in R16";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().label).toBe("");
    expect(systemUnderTest.currentLine().mnemonic).toBe("LDI");
    expect(systemUnderTest.currentLine().operands).toEqual(["R16", "23"]);
});

Deno.test("A line could be just a comment", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "; Just a comment";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().label).toBe("");
    expect(systemUnderTest.currentLine().mnemonic).toBe("");
    expect(systemUnderTest.currentLine().operands).toEqual([]);
});
