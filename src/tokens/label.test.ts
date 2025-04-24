import { expect } from "jsr:@std/expect";
import { testLine } from "./testing.ts";
import { tokensAssemblyPipeline } from "./assembly-pipeline.ts";

Deno.test("A line containing a colon contains a label", () => {
    const line = testLine("label: LDI R16, 23");
    const result = tokensAssemblyPipeline(line);
    expect(result.label).toBe("label");
    expect(result.mnemonic).toBe("LDI");
    expect(result.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("A line can contain JUST a label", () => {
    const line = testLine("label:");
    const result = tokensAssemblyPipeline(line);
    expect(result.label).toBe("label");
    expect(result.mnemonic).toBe("");
    expect(result.symbolicOperands.length).toBe(0);
});

Deno.test("A label must only contain alphanumerics or underscore", () => {
    const badLines = [
        "count bytes:",
        "count-bytes:",
        "count$bytes:",
        "count?bytes:"
    ];
    for (const line of badLines) {
        const result = tokensAssemblyPipeline(testLine(line));
        expect(result.failed()).toBeTruthy();
        const failures = result.failures().toArray();
        expect (failures.length).toBe(1);
        const failure = failures[0]!;
        expect(failure.kind).toBe("syntax_invalidLabel");
    }
    const goodLines = [
        "countBytes:",
        "count_bytes:",
        "count_8bit:"
    ];
    for (const line of goodLines) {
        const result = tokensAssemblyPipeline(testLine(line));
        expect(result.failed()).toBeFalsy();
    }
});

