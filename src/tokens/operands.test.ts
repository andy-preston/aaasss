import type { AssertionFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { dummyLine } from "../line/line-types.ts";
import { tokens } from "./assembly-pipeline.ts";

Deno.test("The mnemonic is separated from the operands by whitespace", () => {
    const line = dummyLine(false);
    line.assemblySource = "LDI R16, 23";
    tokens(line);
    expect(line.label).toBe("");
    expect(line.mnemonic).toBe("LDI");
    expect(line.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("The operands are separated by a comma", () => {
    const line = dummyLine(false);
    line.assemblySource = "label: LDI R16, 23";
    tokens(line);
    expect(line.label).toBe("label");
    expect(line.mnemonic).toBe("LDI");
    expect(line.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("No instruction has three (or more) operands", () => {
    const line = dummyLine(false);
    line.assemblySource = "LDI R16, 23, 999";
    tokens(line);
    expect(line.symbolicOperands).toEqual(["R16", "23"]);
    expect(line.failed()).toBeTruthy();
    expect(line.failures.length).toBe(1);
    const failure = line.failures[0] as AssertionFailure;
    expect(failure.kind).toBe("operand_count");
    expect(failure.expected).toBe("2");
    expect(failure.actual).toBe("3")
});

Deno.test("An operand must not be empty", () => {
    const line = dummyLine(false);
    line.assemblySource = "LDI , 23";
    tokens(line);
    expect(line.symbolicOperands).toEqual(["", "23"]);
    expect(line.failed()).toBeTruthy();
    expect(line.failures.length).toBe(1);
    const failure = line.failures[0]!;
    expect(failure.kind).toBe("operand_blank");
    expect(failure.location).toEqual({"operand": 0});
});

Deno.test("Trailing commas count as an (empty operand)", () => {
    const line = dummyLine(false);
    line.assemblySource = "LDI r16, ";
    tokens(line);
    expect(line.symbolicOperands).toEqual(["R16", ""]);
    expect(line.failed()).toBeTruthy();
    expect(line.failures.length).toBe(1);
    const failure = line.failures[0]!;
    expect(failure.kind).toBe("operand_blank");
    expect(failure.location).toEqual({"operand": 1});
});

Deno.test("Some instructions only have one operand", () => {
    const line = dummyLine(false);
    line.assemblySource = "label: INC R16";
    tokens(line);
    expect(line.label).toBe("label");
    expect(line.mnemonic).toBe("INC");
    expect(line.symbolicOperands).toEqual(["R16"]);
});

Deno.test("Some instructions only have no operands at all", () => {
    const line = dummyLine(false);
    line.assemblySource = "label: RETI";
    tokens(line);
    expect(line.label).toBe("label");
    expect(line.mnemonic).toBe("RETI");
    expect(line.symbolicOperands.length).toBe(0);
});

Deno.test("Operands can contain whitespace and even be JS expressions", () => {
    const line = dummyLine(false);
    line.assemblySource = "label: LDI baseReg + n, n * 2";
    tokens(line);
    expect(line.label).toBe("label");
    expect(line.mnemonic).toBe("LDI");
    expect(line.symbolicOperands).toEqual(["baseReg + n", "n * 2"]);
});

Deno.test("Z+q operands can appear as the second operand of an LDD instruction", () => {
    const line = dummyLine(false);
    line.assemblySource = "LDD R14, Z+offset";
    tokens(line);
    expect(line.label).toBe("");
    expect(line.mnemonic).toBe("LDD");
    expect(line.symbolicOperands).toEqual(["R14", "Z+", "offset"]);
});

Deno.test("... but not the first", () => {
    const line = dummyLine(false);
    line.assemblySource = "LDD Z+offset, R14";
    tokens(line);
    expect(line.mnemonic).toBe("LDD");
    expect(line.symbolicOperands).toEqual(["Z+offset", "R14"]);
    expect(line.failed()).toBeTruthy();
    expect(line.failures.length).toBe(1);
    const failure = line.failures[0]!;
    expect(failure.kind).toBe("operand_offsetNotStd");
    expect(failure.location).toEqual({"operand": 0});
});

Deno.test("... or the first operand of a STD instruction", () => {
    const line = dummyLine(false);
    line.assemblySource = "STD Y+0xa7, R17";
    tokens(line);
    expect(line.failed()).toBeFalsy();
    expect(line.label).toBe("");
    expect(line.mnemonic).toBe("STD");
    expect(line.symbolicOperands).toEqual(["Y+", "0xa7", "R17"]);
});

Deno.test("... but not the second", () => {
    const line = dummyLine(false);
    line.assemblySource = "STD R17, Y+0xa7";
    tokens(line);
    expect(line.mnemonic).toBe("STD");
    expect(line.symbolicOperands).toEqual(["R17", "Y+0xa7"]);
    expect(line.failed()).toBeTruthy();
    expect(line.failures.length).toBe(1);
    const failure = line.failures[0]!;
    expect(failure.kind).toBe("operand_offsetNotLdd");
    expect(failure.location).toEqual({"operand": 1});
});

Deno.test("... but not as the first operand of any other instruction", () => {
    const line = dummyLine(false);
    line.assemblySource = "ST Z+19, R17";
    tokens(line);
    expect(line.mnemonic).toBe("ST");
    expect(line.symbolicOperands).toEqual(["Z+19", "R17"]);
    expect(line.failed()).toBeTruthy();
    expect(line.failures.length).toBe(1);
    const failure = line.failures[0]!;
    expect(failure.kind).toBe("operand_offsetNotStd");
    expect(failure.location).toEqual({"operand": 0});
});

Deno.test("... or the second operand", () => {
    const line = dummyLine(false);
    line.assemblySource = "LDI R14, Z+offset";
    tokens(line);
    expect(line.mnemonic).toBe("LDI");
    expect(line.symbolicOperands).toEqual(["R14", "Z+offset"]);
    expect(line.failed()).toBeTruthy();
    expect(line.failures.length).toBe(1);
    const failure = line.failures[0]!;
    expect(failure.kind).toBe("operand_offsetNotLdd");
    expect(failure.location).toEqual({"operand": 1});
});

Deno.test("Post-increment is not mistaken for an index offset", () => {
    const line = dummyLine(false);
    line.assemblySource = "LPM R14, Z+";
    tokens(line);
    expect(line.failed()).toBeFalsy();
    expect(line.label).toBe("");
    expect(line.mnemonic).toBe("LPM");
    expect(line.symbolicOperands).toEqual(["R14", "Z+"]);
});
