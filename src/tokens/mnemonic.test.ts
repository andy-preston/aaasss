import { expect } from "jsr:@std/expect";
import { dummyLine } from "../line/line-types.ts";
import { tokens } from "./assembly-pipeline.ts";

Deno.test("Mnemonics are automatically converted to upper case", () => {
    const line = dummyLine(false);
    line.assemblySource = "ldi R16, \t 23";
    tokens(line);
    expect(line.label).toBe("");
    expect(line.mnemonic).toBe("LDI");
    expect(line.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("Mnemonics are only letters", () => {
    const line = dummyLine(false);
    line.assemblySource = "LPM.X+ R16";
    tokens(line);
    expect(line.failed()).toBe(true);
    expect(line.failures.length).toBe(1);
    const failure = line.failures[0]!;
    expect(failure.kind).toBe("syntax_invalidMnemonic");
});
