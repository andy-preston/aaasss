import { expect } from "jsr:@std/expect";
import { testLine } from "./testing.ts";
import { tokensAssemblyPipeline } from "./assembly-pipeline.ts";

Deno.test("Leading and trailing whitespace is discarded", () => {
    const line = testLine("\tLDI R16, 23   ");
    const result = tokensAssemblyPipeline(line);
    expect(result.label).toBe("");
    expect(result.mnemonic).toBe("LDI");
    expect(result.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("Lines could be entirely blank", () => {
    const line = testLine("");
    const result = tokensAssemblyPipeline(line);
    expect(result.label).toBe("");
    expect(result.mnemonic).toBe("");
    expect(result.symbolicOperands.length).toBe(0);
});

Deno.test("Multiple spaces are reduced to one space", () => {
    const line = testLine("LDI     R16, \t 23");
    const result = tokensAssemblyPipeline(line);
    expect(result.label).toBe("");
    expect(result.mnemonic).toBe("LDI");
    expect(result.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("Comments are stripped and discarded", () => {
    const line = testLine("LDI R16, 23 ; Put 16 in R16");
    const result = tokensAssemblyPipeline(line);
    expect(result.label).toBe("");
    expect(result.mnemonic).toBe("LDI");
    expect(result.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("A line could be just a comment", () => {
    const line = testLine("; Just a comment");
    const result = tokensAssemblyPipeline(line);
    expect(result.label).toBe("");
    expect(result.mnemonic).toBe("");
    expect(result.symbolicOperands.length).toBe(0);
});
