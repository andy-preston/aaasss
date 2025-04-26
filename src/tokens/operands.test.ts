import type { AssertionFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { tokensAssemblyPipeline } from "./assembly-pipeline.ts";
import { testLine } from "./testing.ts";

Deno.test("The mnemonic is separated from the operands by whitespace", () => {
    const line = testLine("LDI R16, 23");
    const result = tokensAssemblyPipeline(line);
    expect(result.label).toBe("");
    expect(result.mnemonic).toBe("LDI");
    expect(result.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("The operands are separated by a comma", () => {
    const line = testLine("label: LDI R16, 23");
    const result = tokensAssemblyPipeline(line);
    expect(result.label).toBe("label");
    expect(result.mnemonic).toBe("LDI");
    expect(result.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("No instruction has three (or more) operands", () => {
    const line = testLine("LDI R16, 23, 999");
    const result = tokensAssemblyPipeline(line);
    expect(result.symbolicOperands).toEqual(["R16", "23"]);
    expect(result.failed()).toBeTruthy();
    const failures = [...result.failures()];
    expect(failures.length).toBe(1);
    const failure = failures[0] as AssertionFailure;
    expect(failure.kind).toBe("operand_count");
    expect(failure.expected).toBe("2");
    expect(failure.actual).toBe("3")
});

Deno.test("An operand must not be empty", () => {
    const line = testLine("LDI , 23");
    const result = tokensAssemblyPipeline(line);
    expect(result.symbolicOperands).toEqual(["", "23"]);
    expect(result.failed()).toBeTruthy();
    const failures = [...result.failures()];
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("operand_blank");
    expect(failure.location).toEqual({"operand": 0});
});

Deno.test("Trailing commas count as an (empty operand)", () => {
    const line = testLine("LDI r16, ");
    const result = tokensAssemblyPipeline(line);
    expect(result.symbolicOperands).toEqual(["R16", ""]);
    expect(result.failed()).toBeTruthy();
    const failures = result.failures().toArray();
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("operand_blank");
    expect(failure.location).toEqual({"operand": 1});
});

Deno.test("Some instructions only have one operand", () => {
    const line = testLine("label: INC R16");
    const result = tokensAssemblyPipeline(line);
    expect(result.label).toBe("label");
    expect(result.mnemonic).toBe("INC");
    expect(result.symbolicOperands).toEqual(["R16"]);
});

Deno.test("Some instructions only have no operands at all", () => {
    const line = testLine("label: RETI");
    const result = tokensAssemblyPipeline(line);
    expect(result.label).toBe("label");
    expect(result.mnemonic).toBe("RETI");
    expect(result.symbolicOperands.length).toBe(0);
});

Deno.test("Operands can contain whitespace and even be JS expressions", () => {
    const line = testLine("label: LDI baseReg + n, n * 2");
    const result = tokensAssemblyPipeline(line);
    expect(result.label).toBe("label");
    expect(result.mnemonic).toBe("LDI");
    expect(result.symbolicOperands).toEqual(["baseReg + n", "n * 2"]);
});

Deno.test("Z+q operands can appear as the second operand of an LDD instruction", () => {
    const line = testLine("LDD R14, Z+offset");
    const result = tokensAssemblyPipeline(line);
    expect(result.label).toBe("");
    expect(result.mnemonic).toBe("LDD");
    expect(result.symbolicOperands).toEqual(["R14", "Z+", "offset"]);
});

Deno.test("... but not the first", () => {
    const line = testLine("LDD Z+offset, R14");
    const result = tokensAssemblyPipeline(line);
    expect(result.mnemonic).toBe("LDD");
    expect(result.symbolicOperands).toEqual(["Z+offset", "R14"]);
    expect(result.failed()).toBeTruthy();
    const failures = [...result.failures()];
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("operand_offsetNotStd");
    expect(failure.location).toEqual({"operand": 0});
});

Deno.test("... or the first operand of a STD instruction", () => {
    const line = testLine("STD Y+0xa7, R17");
    const result = tokensAssemblyPipeline(line);
    expect(result.failed()).toBeFalsy();
    expect(result.label).toBe("");
    expect(result.mnemonic).toBe("STD");
    expect(result.symbolicOperands).toEqual(["Y+", "0xa7", "R17"]);
});

Deno.test("... but not the second", () => {
    const line = testLine("STD R17, Y+0xa7");
    const result = tokensAssemblyPipeline(line);
    expect(result.mnemonic).toBe("STD");
    expect(result.symbolicOperands).toEqual(["R17", "Y+0xa7"]);
    expect(result.failed()).toBeTruthy();
    const failures = [...result.failures()];
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("operand_offsetNotLdd");
    expect(failure.location).toEqual({"operand": 1});
});

Deno.test("... but not as the first operand of any other instruction", () => {
    const line = testLine("ST Z+19, R17");
    const result = tokensAssemblyPipeline(line);
    expect(result.mnemonic).toBe("ST");
    expect(result.symbolicOperands).toEqual(["Z+19", "R17"]);
    expect(result.failed()).toBeTruthy();
    const failures = [...result.failures()];
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("operand_offsetNotStd");
    expect(failure.location).toEqual({"operand": 0});
 });

Deno.test("... or the second operand", () => {
    const line = testLine("LDI R14, Z+offset");
    const result = tokensAssemblyPipeline(line);
    expect(result.mnemonic).toBe("LDI");
    expect(result.symbolicOperands).toEqual(["R14", "Z+offset"]);
    expect(result.failed()).toBeTruthy();
    const failures = [...result.failures()];
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("operand_offsetNotLdd");
    expect(failure.location).toEqual({"operand": 1});
});

Deno.test("Post-increment is not mistaken for an index offset", () => {
    const line = testLine("LPM R14, Z+");
    const result = tokensAssemblyPipeline(line);
    expect(result.failed()).toBeFalsy();
    expect(result.label).toBe("");
    expect(result.mnemonic).toBe("LPM");
    expect(result.symbolicOperands).toEqual(["R14", "Z+"]);
});
