import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("Mnemonics are automatically converted to upper case", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "ldi R16, \t 23";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(systemUnderTest.currentLine().label).toBe("");
    expect(systemUnderTest.currentLine().mnemonic).toBe("LDI");
    expect(systemUnderTest.currentLine().operands).toEqual(["R16", "23"]);
});

Deno.test("Mnemonics are only letters", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "LPM.X+ R16";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "syntax_invalidMnemonic", "location": undefined
    }]);
});

Deno.test("Except when it's a single dot", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "testLabel: . testFunc(5)";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(systemUnderTest.currentLine().label).toBe("testLabel");
    expect(systemUnderTest.currentLine().mnemonic).toBe(".");
    expect(systemUnderTest.currentLine().operands).toEqual(["testFunc(5)"]);
});

Deno.test("And that single dot can be part of the 'operand'", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "testLabel: .testFunc(5)";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(systemUnderTest.currentLine().label).toBe("testLabel");
    expect(systemUnderTest.currentLine().mnemonic).toBe(".");
    expect(systemUnderTest.currentLine().operands).toEqual(["testFunc(5)"]);
});
