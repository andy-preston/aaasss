import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("A line containing a colon contains a label", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "label: LDI R16, 23";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().label).toBe("label");
    expect(systemUnderTest.currentLine().mnemonic).toBe("LDI");
    expect(systemUnderTest.currentLine().operands).toEqual(["R16", "23"]);
});

Deno.test("A line can contain JUST a label", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode = "label:";
    systemUnderTest.tokens();
    expect(systemUnderTest.currentLine().label).toBe("label");
    expect(systemUnderTest.currentLine().mnemonic).toBe("");
    expect(systemUnderTest.currentLine().operands).toEqual([]);
});

Deno.test("A label must only contain alphanumerics or underscore", () => {
    ["countBytes:", "count_bytes:", "count_8bit:"].forEach(
        (sourceCode) => {
            const systemUnderTest = testSystem();
            systemUnderTest.currentLine().sourceCode = sourceCode;
            systemUnderTest.tokens();
            expect(systemUnderTest.currentLine().failures()).toEqual([]);
        }
    );
});

Deno.test("A label with characters outside that character set failes", () => {
    ["count bytes:", "count-bytes:", "count$bytes:", "count?bytes:"].forEach(
        (sourceCode) => {
            const systemUnderTest = testSystem();
            systemUnderTest.currentLine().sourceCode = sourceCode;
            systemUnderTest.tokens();
            expect(
                systemUnderTest.currentLine().failures(),
                sourceCode
            ).toEqual([{
                "kind": "syntax_invalidLabel", "location": undefined
            }]);
        }
    );
});
