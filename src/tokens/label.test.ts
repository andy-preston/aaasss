import { BoringFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("A line containing a colon contains a label", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "label: LDI R16, 23";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().label).toBe("label");
    expect(systemUnderTest.currentLine().mnemonic).toBe("LDI");
    expect(systemUnderTest.currentLine().operands).toEqual(["R16", "23"]);
});

Deno.test("A line can contain JUST a label", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().assemblySource = "label:";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().label).toBe("label");
    expect(systemUnderTest.currentLine().mnemonic).toBe("");
    expect(systemUnderTest.currentLine().operands.length).toBe(0);
});

Deno.test("A label must only contain alphanumerics or underscore", () => {
    ["count bytes:", "count-bytes:", "count$bytes:", "count?bytes:"].forEach(
        (sourceCode) => {
            const systemUnderTest = testSystem();
            systemUnderTest.currentLine().assemblySource = sourceCode;
            systemUnderTest.tokens();
            expect(systemUnderTest.currentLine().failures.length).toBe(1);
            const failure =
                systemUnderTest.currentLine().failures[0] as BoringFailure;
            expect(failure.kind).toBe("syntax_invalidLabel");
        }
    );
    ["countBytes:", "count_bytes:", "count_8bit:"].forEach(
        (sourceCode) => {
            const systemUnderTest = testSystem();
            systemUnderTest.currentLine().assemblySource = sourceCode;
            systemUnderTest.tokens();
            expect(systemUnderTest.currentLine().failures.length).toBe(0);
        }
    );
});
