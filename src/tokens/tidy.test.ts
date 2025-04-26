import { expect } from "jsr:@std/expect";
import { systemUnderTest } from "./testing.ts";

Deno.test("Leading and trailing whitespace is discarded", () => {
    const system = systemUnderTest(
        "\tLDI R16, 23   "
    );
    const result = system.assemblyPipeline.next().value!;
    expect(result.label).toBe("");
    expect(result.mnemonic).toBe("LDI");
    expect(result.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("Lines could be entirely blank", () => {
    const system = systemUnderTest(
        ""
    );
    const result = system.assemblyPipeline.next().value!;
    expect(result.label).toBe("");
    expect(result.mnemonic).toBe("");
    expect(result.symbolicOperands.length).toBe(0);
});

Deno.test("Multiple spaces are reduced to one space", () => {
    const system = systemUnderTest(
        "LDI     R16, \t 23"
    );
    const result = system.assemblyPipeline.next().value!;
    expect(result.label).toBe("");
    expect(result.mnemonic).toBe("LDI");
    expect(result.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("Comments are stripped and discarded", () => {
    const system = systemUnderTest(
        "LDI R16, 23 ; Put 16 in R16"
    );
    const result = system.assemblyPipeline.next().value!;
    expect(result.label).toBe("");
    expect(result.mnemonic).toBe("LDI");
    expect(result.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("A line could be just a comment", () => {
    const system = systemUnderTest(
        "; Just a comment"
    );
    const result = system.assemblyPipeline.next().value!;
    expect(result.label).toBe("");
    expect(result.mnemonic).toBe("");
    expect(result.symbolicOperands.length).toBe(0);
});
