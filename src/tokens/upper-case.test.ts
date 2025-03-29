import { expect } from "jsr:@std/expect";
import { testLine } from "./testing.ts";
import { tokenise } from "./tokenise.ts";

Deno.test("Mnemonics are automatically converted to upper case", () => {
    const line = testLine("ldi R16, \t 23");
    const tokenised = tokenise(line);
    expect(tokenised.label).toBe("");
    expect(tokenised.mnemonic).toBe("LDI");
    expect(tokenised.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("... but operands aren't", () => {
    const line = testLine("ldi _register, \t 23");
    const tokenised = tokenise(line);
    expect(tokenised.label).toBe("");
    expect(tokenised.mnemonic).toBe("LDI");
    expect(tokenised.symbolicOperands).toEqual(["_register", "23"]);
});

Deno.test("... unless they are register names", () => {
    const line = testLine("ldi r16, 23");
    const tokenised = tokenise(line);
    expect(tokenised.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("... or index register names", () => {
    const line = testLine("ldi x, 23");
    const tokenised = tokenise(line);
    expect(tokenised.symbolicOperands).toEqual(["X", "23"]);
});
