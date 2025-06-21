import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("Operands are not converted to upper case", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "ldi _register, \t 23";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().label).toBe("");
    expect(systemUnderTest.currentLine().mnemonic).toBe("LDI");
    expect(systemUnderTest.currentLine().operands).toEqual(["_register", "23"]);
});

Deno.test("... unless they are register names", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "ldi r16, 23";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().operands).toEqual(["R16", "23"]);
});

Deno.test("... or index register names", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "ldi x, 23";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().operands).toEqual(["X", "23"]);
});

Deno.test("... or post/pre increment", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "lpm z+, r12";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().operands).toEqual(["Z+", "R12"]);
});
