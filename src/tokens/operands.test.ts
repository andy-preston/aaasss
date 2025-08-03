import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("The mnemonic is separated from the operands by whitespace", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "LDI R16, 23";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.currentLine().label).toBe("");
    expect(systemUnderTest.currentLine().mnemonic).toBe("LDI");
    expect(systemUnderTest.currentLine().operands).toEqual(["R16", "23"]);
});

Deno.test("The operands are separated by a comma", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "label: LDI R16, 23";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.currentLine().label).toBe("label");
    expect(systemUnderTest.currentLine().mnemonic).toBe("LDI");
    expect(systemUnderTest.currentLine().operands).toEqual(["R16", "23"]);
});

Deno.test("A missing parameter is tokenised as an empty string", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "LDI , 23";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.currentLine().operands).toEqual(["", "23"]);
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
});

Deno.test("Trailing commas count as an empty operand", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "LDI r16, ";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.currentLine().operands).toEqual(["R16", ""]);
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
});

Deno.test("Some instructions only have one operand", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "label: INC R16";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.currentLine().label).toBe("label");
    expect(systemUnderTest.currentLine().mnemonic).toBe("INC");
    expect(systemUnderTest.currentLine().operands).toEqual(["R16"]);
});

Deno.test("Some instructions have no operands at all", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "label: RETI";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.currentLine().label).toBe("label");
    expect(systemUnderTest.currentLine().mnemonic).toBe("RETI");
    expect(systemUnderTest.currentLine().operands).toEqual([]);
});

Deno.test("Operands can contain whitespace and even be JS expressions", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "label: LDI baseReg + n, n * 2";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.currentLine().label).toBe("label");
    expect(systemUnderTest.currentLine().mnemonic).toBe("LDI");
    expect(systemUnderTest.currentLine().operands).toEqual(["baseReg + n", "n * 2"]);
});

Deno.test("Operands are not converted to upper case", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "ldi _register, \t 23";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.currentLine().label).toBe("");
    expect(systemUnderTest.currentLine().mnemonic).toBe("LDI");
    expect(systemUnderTest.currentLine().operands).toEqual(["_register", "23"]);
});

Deno.test("... unless they are register names", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "ldi r16, 23";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.currentLine().operands).toEqual(["R16", "23"]);
});

Deno.test("... or (word) index register names", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "ldi x, 23";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.currentLine().operands).toEqual(["X", "23"]);
});

Deno.test("... or (byte) index register names", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "ldi zh, 23";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.currentLine().operands).toEqual(["ZH", "23"]);
});

Deno.test("... or mixed-case (byte) index register names", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "ldi Yl, 23";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.currentLine().operands).toEqual(["YL", "23"]);
});

Deno.test("... or post/pre increment", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "lpm z+, r12";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.currentLine().operands).toEqual(["Z+", "R12"]);
});

Deno.test("Commas inside parentheses do not delimit operands", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "cmp r12, testing(1,2,3)";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.currentLine().operands).toEqual([
        "R12", "testing(1,2,3)"
    ]);
});

Deno.test("Too many opening parentheses result in failure", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "cmp r12, testing((1,2,3)";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "syntax_parenthesesNesting", "location": undefined,
        "clue": "1"
    }]);
    expect(systemUnderTest.currentLine().operands).toEqual([]);
});

Deno.test("Too many closing parentheses result in failure", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "cmp r12, testing(1,2,3)))";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "syntax_parenthesesNesting", "location": undefined,
        "clue": "-2"
    }]);
    expect(systemUnderTest.currentLine().operands).toEqual([]);
});
