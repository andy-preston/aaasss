import { expect } from "jsr:@std/expect";
import { systemUnderTest } from "./testing.ts";

Deno.test("A line containing a colon contains a label", () => {
    const system = systemUnderTest(
        "label: LDI R16, 23"
    );
    const result = system.assemblyPipeline.next().value!;
    expect(result.label).toBe("label");
    expect(result.mnemonic).toBe("LDI");
    expect(result.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("A line can contain JUST a label", () => {
    const system = systemUnderTest(
        "label:"
    );
    const result = system.assemblyPipeline.next().value!;
    expect(result.label).toBe("label");
    expect(result.mnemonic).toBe("");
    expect(result.symbolicOperands.length).toBe(0);
});

Deno.test("A label must only contain alphanumerics or underscore", () => {
    const badSystem = systemUnderTest(
        "count bytes:", "count-bytes:", "count$bytes:", "count?bytes:"
    );
    for (const result of badSystem.assemblyPipeline) {
        expect(result.failed()).toBeTruthy();
        const failures = [...result.failures()];
        expect (failures.length).toBe(1);
        const failure = failures[0]!;
        expect(failure.kind).toBe("syntax_invalidLabel");
    }

    const goodSystem = systemUnderTest(
        "countBytes:", "count_bytes:", "count_8bit:"
    );
    for (const result of goodSystem.assemblyPipeline) {
        expect(result.failed()).toBeFalsy();
        expect([...result.failures()].length).toBe(0);
    }
});

