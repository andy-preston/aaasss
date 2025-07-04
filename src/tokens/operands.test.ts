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

Deno.test("A missing parameter is tokenised as an empty string", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "LDI , 23";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().operands).toEqual(["", "23"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
});

Deno.test("Trailing commas count as an empty operand", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "LDI r16, ";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().operands).toEqual(["R16", ""]);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
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
