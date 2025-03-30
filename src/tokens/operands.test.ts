import { expect } from "jsr:@std/expect";
import type { ClueFailure } from "../failure/bags.ts";
import { tokenise } from "./tokenise.ts";
import { testLine } from "./testing.ts";

Deno.test("The mnemonic is separated from the operands by whitespace", () => {
    const line = testLine("LDI R16, 23");
    const tokenised = tokenise(line);
    expect(tokenised.label).toBe("");
    expect(tokenised.mnemonic).toBe("LDI");
    expect(tokenised.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("The operands are separated by a comma", () => {
    const line = testLine("label: LDI R16, 23");
    const tokenised = tokenise(line);
    expect(tokenised.label).toBe("label");
    expect(tokenised.mnemonic).toBe("LDI");
    expect(tokenised.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("No instruction has three (or more) operands", () => {
    const line = testLine("LDI R16, 23, 999");
    const tokenised = tokenise(line);
    expect(tokenised.symbolicOperands).toEqual(["R16", "23"]);
    expect(tokenised.failed()).toBeTruthy();
    const failures = tokenised.failures().toArray();
    expect(failures.length).toBe(1);
    const failure = failures[0] as ClueFailure;
    expect(failure.kind).toBe("operand_wrongCount");
    expect(failure.clue).toBe("3");
});

Deno.test("An operand must not be empty", () => {
    const line = testLine("LDI , 23");
    const tokenised = tokenise(line);
    expect(tokenised.symbolicOperands).toEqual(["", "23"]);
    expect(tokenised.failed()).toBeTruthy();
    const failures = tokenised.failures().toArray();
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("operand_blank");
    expect(failure.location).toEqual({"operand": 0});
});

Deno.test("Trailing commas count as an (empty operand)", () => {
    const line = testLine("LDI r16, ");
    const tokenised = tokenise(line);
    expect(tokenised.symbolicOperands).toEqual(["R16", ""]);
    expect(tokenised.failed()).toBeTruthy();
    const failures = tokenised.failures().toArray();
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("operand_blank");
    expect(failure.location).toEqual({"operand": 1});
});

Deno.test("Some instructions only have one operand", () => {
    const line = testLine("label: INC R16");
    const tokenised = tokenise(line);
    expect(tokenised.label).toBe("label");
    expect(tokenised.mnemonic).toBe("INC");
    expect(tokenised.symbolicOperands).toEqual(["R16"]);
});

Deno.test("Some instructions only have no operands at all", () => {
    const line = testLine("label: RETI");
    const tokenised = tokenise(line);
    expect(tokenised.label).toBe("label");
    expect(tokenised.mnemonic).toBe("RETI");
    expect(tokenised.symbolicOperands.length).toBe(0);
});

Deno.test("Operands can contain whitespace and even be JS expressions", () => {
    const line = testLine("label: LDI baseReg + n, n * 2");
    const tokenised = tokenise(line);
    expect(tokenised.label).toBe("label");
    expect(tokenised.mnemonic).toBe("LDI");
    expect(tokenised.symbolicOperands).toEqual(["baseReg + n", "n * 2"]);
});

Deno.test("Z+q operands can appear as the second operand of an LDD instruction", () => {
    const line = testLine("LDD R14, Z+offset");
    const tokenised = tokenise(line);
    expect(tokenised.label).toBe("");
    expect(tokenised.mnemonic).toBe("LDD");
    expect(tokenised.symbolicOperands).toEqual(["R14", "Z+", "offset"]);
});

Deno.test("... or the first operand of a STD instruction", () => {
    const line = testLine("STD Y+0xa7, R17");
    const tokenised = tokenise(line);
    expect(tokenised.label).toBe("");
    expect(tokenised.mnemonic).toBe("STD");
    expect(tokenised.symbolicOperands).toEqual(["Y+", "0xa7", "R17"]);
});

Deno.test("... but not as the first operand of any other instruction", () => {
    const line = testLine("ST Z+19, R17");
    const tokenised = tokenise(line);
    expect(tokenised.mnemonic).toBe("ST");
    expect(tokenised.symbolicOperands).toEqual(["Z+19", "R17"]);
    expect(tokenised.failed()).toBeTruthy();
    const failures = tokenised.failures().toArray();
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("operand_offsetNotStd");
    expect(failure.location).toEqual({"operand": 0});
 });

Deno.test("... or the second operand", () => {
    const line = testLine("LDI R14, Z+offset");
    const tokenised = tokenise(line);
    expect(tokenised.mnemonic).toBe("LDI");
    expect(tokenised.symbolicOperands).toEqual(["R14", "Z+offset"]);
    expect(tokenised.failed()).toBeTruthy();
    const failures = tokenised.failures().toArray();
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("operand_offsetNotLdd");
    expect(failure.location).toEqual({"operand": 1});
});
