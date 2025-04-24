import { expect } from "jsr:@std/expect";
import { testLine } from "./testing.ts";
import { tokensAssemblyPipeline } from "./assembly-pipeline.ts";

Deno.test("Mnemonics are automatically converted to upper case", () => {
    const line = testLine("ldi R16, \t 23");
    const result = tokensAssemblyPipeline(line);
    expect(result.label).toBe("");
    expect(result.mnemonic).toBe("LDI");
    expect(result.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("Mnemonics are only letters", () => {
    const line = testLine("LPM.X+ R16");
    const result = tokensAssemblyPipeline(line);
    expect(result.failed()).toBeTruthy();
    const failures = result.failures().toArray();
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("syntax_invalidMnemonic");
});
