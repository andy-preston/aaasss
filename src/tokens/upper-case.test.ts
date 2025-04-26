import { expect } from "jsr:@std/expect";
import { systemUnderTest } from "./testing.ts";

Deno.test("Operands are not converted to upper case", () => {
    const system = systemUnderTest(
        "ldi _register, \t 23"
    );
    const result = system.assemblyPipeline.next().value!;
    expect(result.label).toBe("");
    expect(result.mnemonic).toBe("LDI");
    expect(result.symbolicOperands).toEqual(["_register", "23"]);
});

Deno.test("... unless they are register names", () => {
    const system = systemUnderTest(
        "ldi r16, 23"
    );
    const result = system.assemblyPipeline.next().value!;
    expect(result.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("... or index register names", () => {
    const system = systemUnderTest(
        "ldi x, 23"
    );
    const result = system.assemblyPipeline.next().value!;
    expect(result.symbolicOperands).toEqual(["X", "23"]);
});

Deno.test("... or post/pre increment", () => {
    const system = systemUnderTest(
        "lpm z+, r12"
    );
    const result = system.assemblyPipeline.next().value!;
    expect(result.symbolicOperands).toEqual(["Z+", "R12"]);
});
