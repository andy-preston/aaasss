import { assertEquals } from "jsr:@std/assert";
import { testLine } from "./testing.ts";
import { tokenise } from "./tokenise.ts";

Deno.test("Mnemonics are automatically converted to upper case", () => {
    const line = testLine("ldi R16, \t 23");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "");
    assertEquals(tokenised.mnemonic, "LDI");
    assertEquals(tokenised.symbolicOperands, ["R16", "23"]);
});

Deno.test("... but operands aren't", () => {
    const line = testLine("ldi _register, \t 23");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "");
    assertEquals(tokenised.mnemonic, "LDI");
    assertEquals(tokenised.symbolicOperands, ["_register", "23"]);
});

Deno.test("... unless they are register names", () => {
    const line = testLine("ldi r16, 23");
    const tokenised = tokenise(line);
    assertEquals(tokenised.symbolicOperands, ["R16", "23"]);
});

Deno.test("... or index register names", () => {
    const line = testLine("ldi x, 23");
    const tokenised = tokenise(line);
    assertEquals(tokenised.symbolicOperands, ["X", "23"]);
});
