import { assert, assertEquals } from "assert";
import { assertFailureKind, assertFailureWithExtra } from "../failure/testing.ts";
import { tokenise } from "./tokenise.ts";
import { testLine } from "./testing.ts";

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
    assert(tokenised.failed());
    const failures = tokenised.failures().toArray();
    assertEquals(failures.length, 1);
    assertFailureWithExtra(failures, "operand_wrongCount", ["3"]);
});

Deno.test("An operand must not be empty", () => {
    const line = testLine("LDI , 23");
    const tokenised = tokenise(line);
    assertEquals(tokenised.symbolicOperands, ["", "23"]);
    assert(tokenised.failed());
    const failures = tokenised.failures().toArray();
    assertEquals(failures.length, 1);
    assertFailureKind(failures, "operand_blank");
    assertEquals(failures[0]!.operand, 0);
});

Deno.test("Trailing commas count as an (empty operand)", () => {
    const line = testLine("LDI r16, ");
    const tokenised = tokenise(line);
    assertEquals(tokenised.symbolicOperands, ["R16", ""]);
    assert(tokenised.failed());
    const failures = tokenised.failures().toArray();
    assertEquals(failures.length, 1);
    assertFailureKind(failures, "operand_blank");
    assertEquals(failures[0]!.operand, 1);
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
    assert(tokenised.failed());
    const failures = tokenised.failures().toArray();
    assertEquals(failures.length, 1);
    assertFailureKind(failures, "operand_offsetNotStd");
    assertEquals(failures[0]!.operand, 0);
});

Deno.test("... or the second operand", () => {
    const line = testLine("LDI R14, Z+offset");
    const tokenised = tokenise(line);
    assertEquals(tokenised.mnemonic, "LDI");
    assertEquals(tokenised.symbolicOperands, ["R14", "Z+offset"]);
    assert(tokenised.failed());
    const failures = tokenised.failures().toArray();
    assertEquals(failures.length, 1);
    assertFailureKind(failures, "operand_offsetNotLdd");
    assertEquals(failures[0]!.operand, 1);
});
