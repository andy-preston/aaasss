import { assertEquals } from "assert";
import { tokenise } from "./tokenise.ts";
import type { SourceCode } from "../source-code/data-types.ts";
import { lineWithRenderedJavascript } from "../embedded-js/line-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";

const testLine = (source: SourceCode) => {
    const raw = lineWithRawSource("", 0, false, source, []);
    return lineWithRenderedJavascript(raw, source, []);
};

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
    const line = testLine("ldi _register, \t 23");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "");
    assertEquals(tokenised.mnemonic, "LDI");
    assertEquals(tokenised.symbolicOperands, ["_register", "23"]);
});

Deno.test("... unless they are register names", () => {
    const line = testLine("ldi r16, 23");
    const tokenised = tokenise(line);
    assertEquals(tokenised.symbolicOperands, ["R16", "23"]);
});

Deno.test("... or index register names", () => {
    const line = testLine("ldi x, 23");
    const tokenised = tokenise(line);
    assertEquals(tokenised.symbolicOperands, ["X", "23"]);
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

Deno.test("A label must only contain alphanumerics or underscore", () => {
    const badLines = [
        "count bytes:",
        "count-bytes:",
        "count$bytes:",
        "count?bytes:"
    ];
    for (const line of badLines) {
        const tokenised = tokenise(testLine(line));
        assertEquals(tokenised.failures.length, 1, `${line} should fail`);
        assertEquals(tokenised.failures[0]!.kind, "syntax_invalidLabel");
        assertEquals(tokenised.failures[0]!.operand, undefined);
        assertEquals(tokenised.failures[0]!.extra, undefined);
    }
    const goodLines = [
        "countBytes:",
        "count_bytes:",
        "count_8bit:"
    ];
    for (const line of goodLines) {
        const tokenised = tokenise(testLine(line));
        assertEquals(tokenised.failures.length, 0, `${line} should pass`);
    }
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

Deno.test("No instruction has three (or more) operands", () => {
    const line = testLine("LDI R16, 23, 999");
    const tokenised = tokenise(line);
    assertEquals(tokenised.symbolicOperands, ["R16", "23"]);
    assertEquals(tokenised.failures[0]!.kind, "operand_wrongCount");
    assertEquals(tokenised.failures[0]!.extra, "3");
});

Deno.test("An operand must not be empty", () => {
    const line = testLine("LDI , 23");
    const tokenised = tokenise(line);
    assertEquals(tokenised.symbolicOperands, ["", "23"]);
    assertEquals(tokenised.failures[0]!.kind, "operand_blank");
    assertEquals(tokenised.failures[0]!.operand, 0);
});

Deno.test("Trailing commas count as an (empty operand)", () => {
    const line = testLine("LDI r16, ");
    const tokenised = tokenise(line);
    assertEquals(tokenised.symbolicOperands, ["R16", ""]);
    assertEquals(tokenised.failures[0]!.kind, "operand_blank");
    assertEquals(tokenised.failures[0]!.operand, 1);
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

Deno.test("Z+q operands can appear as the second operand of an LDD instruction", () => {
    const line = testLine("LDD R14, Z+offset");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "");
    assertEquals(tokenised.mnemonic, "LDD");
    assertEquals(tokenised.symbolicOperands, ["R14", "Z+", "offset"]);
});

Deno.test("... or the first operand of a STD instruction", () => {
    const line = testLine("STD Y+0xa7, R17");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "");
    assertEquals(tokenised.mnemonic, "STD");
    assertEquals(tokenised.symbolicOperands, ["Y+", "0xa7", "R17"]);
});

Deno.test("... but not as the first operand of any other instruction", () => {
    const line = testLine("ST Z+19, R17");
    const tokenised = tokenise(line);
    assertEquals(tokenised.mnemonic, "ST");
    assertEquals(tokenised.symbolicOperands, ["Z+19", "R17"]);
    assertEquals(tokenised.failures[0]!.kind, "operand_offsetNotStd");
    assertEquals(tokenised.failures[0]!.operand, 0);
});

Deno.test("... or the second operand", () => {
    const line = testLine("LDI R14, Z+offset");
    const tokenised = tokenise(line);
    assertEquals(tokenised.mnemonic, "LDI");
    assertEquals(tokenised.symbolicOperands, ["R14", "Z+offset"]);
    assertEquals(tokenised.failures[0]!.kind, "operand_offsetNotLdd");
    assertEquals(tokenised.failures[0]!.operand, 1);
});
