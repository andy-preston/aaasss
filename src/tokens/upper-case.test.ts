import { expect } from "jsr:@std/expect";
import { dummyLine } from "../line/line-types.ts";
import { tokens } from "./assembly-pipeline.ts";

Deno.test("Operands are not converted to upper case", () => {
    const line = dummyLine(false, 1);
    line.assemblySource = "ldi _register, \t 23";
    tokens(line);
    expect(line.label).toBe("");
    expect(line.mnemonic).toBe("LDI");
    expect(line.symbolicOperands).toEqual(["_register", "23"]);
});

Deno.test("... unless they are register names", () => {
    const line = dummyLine(false, 1);
    line.assemblySource = "ldi r16, 23";
    tokens(line);
    expect(line.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("... or index register names", () => {
    const line = dummyLine(false, 1);
    line.assemblySource = "ldi x, 23";
    tokens(line);
    expect(line.symbolicOperands).toEqual(["X", "23"]);
});

Deno.test("... or post/pre increment", () => {
    const line = dummyLine(false, 1);
    line.assemblySource = "lpm z+, r12";
    tokens(line);
    expect(line.symbolicOperands).toEqual(["Z+", "R12"]);
});
