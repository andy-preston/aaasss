import { assert, assertEquals } from "jsr:@std/assert";
import { testLine } from "./testing.ts";
import { tokenise } from "./tokenise.ts";

Deno.test("A line containing a colon contains a label", () => {
    const line = testLine("label: LDI R16, 23");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "label");
    assertEquals(tokenised.mnemonic, "LDI");
    assertEquals(tokenised.symbolicOperands, ["R16", "23"]);
});

Deno.test("A line can contain JUST a label", () => {
    const line = testLine("label:");
    const tokenised = tokenise(line);
    assertEquals(tokenised.label, "label");
    assertEquals(tokenised.mnemonic, "");
    assertEquals(tokenised.symbolicOperands, []);
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
        assert(tokenised.failed());
        tokenised.failures().forEach((failure, index) => {
            assertEquals(index, 0);
            assertEquals(failure.kind, "syntax_invalidLabel");
        });
    }
    const goodLines = [
        "countBytes:",
        "count_bytes:",
        "count_8bit:"
    ];
    for (const line of goodLines) {
        const tokenised = tokenise(testLine(line));
        assertEquals(tokenised.failures.length, 0, `${line} should pass`);
    }
});

