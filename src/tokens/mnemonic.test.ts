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

Deno.test("Mnemonics are only letters", () => {
    const line = testLine("LPM.X+ R16");
    const tokenised = tokenise(line);
    expect(tokenised.failed()).toBeTruthy();
    const failures = tokenised.failures().toArray();
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("syntax_invalidMnemonic");
});
