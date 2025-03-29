import { expect } from "jsr:@std/expect";
import { testLine } from "./testing.ts";
import { tokenise } from "./tokenise.ts";

Deno.test("A line containing a colon contains a label", () => {
    const line = testLine("label: LDI R16, 23");
    const tokenised = tokenise(line);
    expect(tokenised.label).toBe("label");
    expect(tokenised.mnemonic).toBe("LDI");
    expect(tokenised.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("A line can contain JUST a label", () => {
    const line = testLine("label:");
    const tokenised = tokenise(line);
    expect(tokenised.label).toBe("label");
    expect(tokenised.mnemonic).toBe("");
    expect(tokenised.symbolicOperands.length).toBe(0);
});

Deno.test("A label must only contain alphanumerics or underscore", () => {
    const badLines = [
        "count bytes:",
        "count-bytes:",
        "count$bytes:",
        "count?bytes:"
    ];
    for (const line of badLines) {
        const tokenised = tokenise(testLine(line));
        expect(tokenised.failed()).toBeTruthy();
        tokenised.failures().forEach((failure, index) => {
            expect(index).toBe(0);
            expect(failure.kind).toBe("syntax_invalidLabel");
        });
    }
    const goodLines = [
        "countBytes:",
        "count_bytes:",
        "count_8bit:"
    ];
    for (const line of goodLines) {
        const tokenised = tokenise(testLine(line));
        expect(tokenised.failures.length).toBe(0);
    }
});

