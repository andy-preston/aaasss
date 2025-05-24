import { expect } from "jsr:@std/expect";
import { dummyLine } from "../line/line-types.ts";
import { tokens } from "./assembly-pipeline.ts";

Deno.test("Leading and trailing whitespace is discarded", () => {
    const line = dummyLine(false);
    line.assemblySource = "\tLDI R16, 23   ";
    tokens(line);
    expect(line.label).toBe("");
    expect(line.mnemonic).toBe("LDI");
    expect(line.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("Lines could be entirely blank", () => {
    const line = dummyLine(false);
    line.assemblySource = "";
    tokens(line);
    expect(line.label).toBe("");
    expect(line.mnemonic).toBe("");
    expect(line.symbolicOperands.length).toBe(0);
});

Deno.test("Multiple spaces are reduced to one space", () => {
    const line = dummyLine(false);
    line.assemblySource = "LDI     R16, \t 23";
    tokens(line);
    expect(line.label).toBe("");
    expect(line.mnemonic).toBe("LDI");
    expect(line.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("Comments are stripped and discarded", () => {
    const line = dummyLine(false);
    line.assemblySource = "LDI R16, 23 ; Put 16 in R16";
    tokens(line);
    expect(line.label).toBe("");
    expect(line.mnemonic).toBe("LDI");
    expect(line.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("A line could be just a comment", () => {
    const line = dummyLine(false);
    line.assemblySource = "; Just a comment";
    tokens(line);
    expect(line.label).toBe("");
    expect(line.mnemonic).toBe("");
    expect(line.symbolicOperands.length).toBe(0);
});
