import type { BoringFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("Mnemonics are automatically converted to upper case", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "ldi R16, \t 23";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().label).toBe("");
    expect(systemUnderTest.currentLine().mnemonic).toBe("LDI");
    expect(systemUnderTest.currentLine().operands).toEqual(["R16", "23"]);
});

Deno.test("Mnemonics are only letters", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "LPM.X+ R16";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as BoringFailure;
    expect(failure.kind).toBe("syntax_invalidMnemonic");
});
