import { expect } from "jsr:@std/expect";
import { systemUnderTest } from "./testing.ts";

Deno.test("Mnemonics are automatically converted to upper case", () => {
    const system = systemUnderTest(
        "ldi R16, \t 23"
    );
    const result = system.assemblyPipeline.next().value!;
    expect(result.label).toBe("");
    expect(result.mnemonic).toBe("LDI");
    expect(result.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("Mnemonics are only letters", () => {
    const system = systemUnderTest(
        "LPM.X+ R16"
    );
    const result = system.assemblyPipeline.next().value!;
    expect(result.failed()).toBeTruthy();
    const failures = [...result.failures()];
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("syntax_invalidMnemonic");
});
