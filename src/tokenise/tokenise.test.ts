import { assertEquals } from "assert";
import { tokenise } from "./tokenise.ts";
import {
    assemblyLine, rawLine, type AssemblyLine, type SourceCode
} from "../pipeline/line.ts";

const testLine = (source: SourceCode): AssemblyLine =>
    assemblyLine(rawLine("", 0, source), source);

Deno.test("Leading and trailing whitespace is discarded", () => {
    const line = testLine("\tLDI R16, 23   ");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "");
    assertEquals(tokenised.mnemonic, "LDI");
    assertEquals(tokenised.symbolicOperands, ["R16", "23"]);
});

Deno.test("Lines could be entirely blank", () => {
    const line = testLine("");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "");
    assertEquals(tokenised.mnemonic, "");
    assertEquals(tokenised.symbolicOperands, []);
});

Deno.test("Multiple spaces are reduced to one space", () => {
    const line = testLine("LDI     R16, \t 23");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "");
    assertEquals(tokenised.mnemonic, "LDI");
    assertEquals(tokenised.symbolicOperands, ["R16", "23"]);
});

Deno.test("Mnemonics are automatically converted to upper case", () => {
    const line = testLine("ldi R16, \t 23");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "");
    assertEquals(tokenised.mnemonic, "LDI");
    assertEquals(tokenised.symbolicOperands, ["R16", "23"]);
});

Deno.test("... but operands aren't", () => {
    const line = testLine("ldi r16, \t 23");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "");
    assertEquals(tokenised.mnemonic, "LDI");
    assertEquals(tokenised.symbolicOperands, ["r16", "23"]);
});

Deno.test("Comments are stripped and discarded", () => {
    const line = testLine("LDI R16, 23 ; Put 16 in R16");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "");
    assertEquals(tokenised.mnemonic, "LDI");
    assertEquals(tokenised.symbolicOperands, ["R16", "23"]);
});

Deno.test("A line could be just a comment", () => {
    const line = testLine("; Just a comment");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "");
    assertEquals(tokenised.mnemonic, "");
    assertEquals(tokenised.symbolicOperands, []);
});

Deno.test("A line containing a colon contains a label", () => {
    const line = testLine("label: LDI R16, 23");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "label");
    assertEquals(tokenised.mnemonic, "LDI");
    assertEquals(tokenised.symbolicOperands, ["R16", "23"]);
});

Deno.test("A line can contain JUST a label", () => {
    const line = testLine("label:");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "label");
    assertEquals(tokenised.mnemonic, "");
    assertEquals(tokenised.symbolicOperands, []);
});

Deno.test("A label may not contain whitespace", () => {
    const line = testLine("count bytes: LDI R16, 23");
    const tokenised = tokenise(line);
    assertEquals(tokenised.failures.length, 1);
    assertEquals(tokenised.failures[0]!.kind, "syntax.spaceInLabel");
    assertEquals(tokenised.failures[0]!.operand, undefined);
    assertEquals(tokenised.failures[0]!.error, undefined);
});

Deno.test("The mnemonic is separated from the operands by whitespace", () => {
    const line = testLine("LDI R16, 23");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "");
    assertEquals(tokenised.mnemonic, "LDI");
    assertEquals(tokenised.symbolicOperands, ["R16", "23"]);
});

Deno.test("The operands are separated by a comma", () => {
    const line = testLine("label: LDI R16, 23");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "label");
    assertEquals(tokenised.mnemonic, "LDI");
    assertEquals(tokenised.symbolicOperands, ["R16", "23"]);
});

Deno.test("Some instructions only have one operand", () => {
    const line = testLine("label: INC R16");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "label");
    assertEquals(tokenised.mnemonic, "INC");
    assertEquals(tokenised.symbolicOperands, ["R16"]);
});

Deno.test("Some instructions only have no operands at all", () => {
    const line = testLine("label: RETI");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "label");
    assertEquals(tokenised.mnemonic, "RETI");
    assertEquals(tokenised.symbolicOperands, []);
});

Deno.test("Operands can contain whitespace and even be JS expressions", () => {
    const line = testLine("label: LDI baseReg + n, n * 2");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "label");
    assertEquals(tokenised.mnemonic, "LDI");
    assertEquals(tokenised.symbolicOperands, ["baseReg + n", "n * 2"]);
});

Deno.test("LDD Z+q operands are tokenised as a 'Z+' and 'q'", () => {
    const line = testLine("LDD R14, Z+23");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "");
    assertEquals(tokenised.mnemonic, "LDD");
    assertEquals(tokenised.symbolicOperands, ["R14", "Z+", "23"]);
});

Deno.test("STD Z+q operands are tokenised as a 'Z+' and 'q'", () => {
    const line = testLine("STD Z+0xa7, R17");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "");
    assertEquals(tokenised.mnemonic, "STD");
    assertEquals(tokenised.symbolicOperands, ["Z+", "0xa7", "R17"]);
});

Deno.test("Only one Z+q operand is allowed in an instruction", () => {
    const line = testLine("LDD Z+12, Z+13");
    const tokenised = tokenise(line);
    assertEquals(tokenised.failures.length, 1);
    assertEquals(tokenised.failures[0]!.kind, "operand.tooManyIndexOffset");
    assertEquals(tokenised.failures[0]!.operand, 1);
    assertEquals(tokenised.failures[0]!.error, undefined);
});
