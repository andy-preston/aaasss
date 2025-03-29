import { expect } from "jsr:@std/expect";
import { testLine } from "./testing.ts";
import { tokenise } from "./tokenise.ts";

Deno.test("Leading and trailing whitespace is discarded", () => {
    const line = testLine("\tLDI R16, 23   ");
    const tokenised = tokenise(line);
    expect(tokenised.label).toBe("");
    expect(tokenised.mnemonic).toBe("LDI");
    expect(tokenised.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("Lines could be entirely blank", () => {
    const line = testLine("");
    const tokenised = tokenise(line);
    expect(tokenised.label).toBe("");
    expect(tokenised.mnemonic).toBe("");
    expect(tokenised.symbolicOperands.length).toBe(0);
});

Deno.test("Multiple spaces are reduced to one space", () => {
    const line = testLine("LDI     R16, \t 23");
    const tokenised = tokenise(line);
    expect(tokenised.label).toBe("");
    expect(tokenised.mnemonic).toBe("LDI");
    expect(tokenised.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("Comments are stripped and discarded", () => {
    const line = testLine("LDI R16, 23 ; Put 16 in R16");
    const tokenised = tokenise(line);
    expect(tokenised.label).toBe("");
    expect(tokenised.mnemonic).toBe("LDI");
    expect(tokenised.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("A line could be just a comment", () => {
    const line = testLine("; Just a comment");
    const tokenised = tokenise(line);
    expect(tokenised.label).toBe("");
    expect(tokenised.mnemonic).toBe("");
    expect(tokenised.symbolicOperands.length).toBe(0);
});
