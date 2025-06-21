import type { AssertionFailure, BoringFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("The mnemonic is separated from the operands by whitespace", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "LDI R16, 23";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().label).toBe("");
    expect(systemUnderTest.currentLine().mnemonic).toBe("LDI");
    expect(systemUnderTest.currentLine().operands).toEqual(["R16", "23"]);
});

Deno.test("The operands are separated by a comma", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "label: LDI R16, 23";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().label).toBe("label");
    expect(systemUnderTest.currentLine().mnemonic).toBe("LDI");
    expect(systemUnderTest.currentLine().operands).toEqual(["R16", "23"]);
});

Deno.test("No instruction has three (or more) operands", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "LDI R16, 23, 999";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().operands).toEqual(["R16", "23"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure =
        systemUnderTest.currentLine().failures[0] as AssertionFailure;
    expect(failure.kind).toBe("operand_count");
    expect(failure.expected).toBe("2");
    expect(failure.actual).toBe("3")
});

Deno.test("An operand must not be empty", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "LDI , 23";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().operands).toEqual(["", "23"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as BoringFailure;
    expect(failure.kind).toBe("operand_blank");
    expect(failure.location).toEqual({"operand": 0});
});

Deno.test("Trailing commas count as an (empty operand)", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "LDI r16, ";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().operands).toEqual(["R16", ""]);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as BoringFailure;
    expect(failure.kind).toBe("operand_blank");
    expect(failure.location).toEqual({"operand": 1});
});

Deno.test("Some instructions only have one operand", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "label: INC R16";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().label).toBe("label");
    expect(systemUnderTest.currentLine().mnemonic).toBe("INC");
    expect(systemUnderTest.currentLine().operands).toEqual(["R16"]);
});

Deno.test("Some instructions have no operands at all", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "label: RETI";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().label).toBe("label");
    expect(systemUnderTest.currentLine().mnemonic).toBe("RETI");
    expect(systemUnderTest.currentLine().operands.length).toBe(0);
});

Deno.test("Operands can contain whitespace and even be JS expressions", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "label: LDI baseReg + n, n * 2";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().label).toBe("label");
    expect(systemUnderTest.currentLine().mnemonic).toBe("LDI");
    expect(systemUnderTest.currentLine().operands).toEqual(["baseReg + n", "n * 2"]);
});

Deno.test("Z+q operands can appear as the second operand of an LDD instruction", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "LDD R14, Z+offset";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().label).toBe("");
    expect(systemUnderTest.currentLine().mnemonic).toBe("LDD");
    expect(systemUnderTest.currentLine().operands).toEqual(["R14", "Z+", "offset"]);
});

Deno.test("... but not the first", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "LDD Z+offset, R14";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().mnemonic).toBe("LDD");
    expect(systemUnderTest.currentLine().operands).toEqual(["Z+offset", "R14"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as BoringFailure;
    expect(failure.kind).toBe("operand_offsetNotStd");
    expect(failure.location).toEqual({"operand": 0});
});

Deno.test("... or the first operand of a STD instruction", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "STD Y+0xa7, R17";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.currentLine().label).toBe("");
    expect(systemUnderTest.currentLine().mnemonic).toBe("STD");
    expect(systemUnderTest.currentLine().operands).toEqual(["Y+", "0xa7", "R17"]);
});

Deno.test("... but not the second", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "STD R17, Y+0xa7";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().mnemonic).toBe("STD");
    expect(systemUnderTest.currentLine().operands).toEqual(["R17", "Y+0xa7"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as BoringFailure;
    expect(failure.kind).toBe("operand_offsetNotLdd");
    expect(failure.location).toEqual({"operand": 1});
});

Deno.test("... but not as the first operand of any other instruction", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "ST Z+19, R17";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().mnemonic).toBe("ST");
    expect(systemUnderTest.currentLine().operands).toEqual(["Z+19", "R17"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as BoringFailure;
    expect(failure.kind).toBe("operand_offsetNotStd");
    expect(failure.location).toEqual({"operand": 0});
});

Deno.test("... or the second operand", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "LDI R14, Z+offset";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().mnemonic).toBe("LDI");
    expect(systemUnderTest.currentLine().operands).toEqual(["R14", "Z+offset"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as BoringFailure;
    expect(failure.kind).toBe("operand_offsetNotLdd");
    expect(failure.location).toEqual({"operand": 1});
});

Deno.test("Post-increment is not mistaken for an index offset", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "LPM R14, Z+";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.currentLine().label).toBe("");
    expect(systemUnderTest.currentLine().mnemonic).toBe("LPM");
    expect(systemUnderTest.currentLine().operands).toEqual(["R14", "Z+"]);
});
