import { expect } from "jsr:@std/expect";
import { dummyLine } from "../line/line-types.ts";
import { tokens } from "./assembly-pipeline.ts";

Deno.test("A line containing a colon contains a label", () => {
    const line = dummyLine(false, 1);
    line.assemblySource = "label: LDI R16, 23";
    tokens(line);
    expect(line.label).toBe("label");
    expect(line.mnemonic).toBe("LDI");
    expect(line.symbolicOperands).toEqual(["R16", "23"]);
});

Deno.test("A line can contain JUST a label", () => {
    const line = dummyLine(false, 1);
    line.assemblySource = "label:";
    tokens(line);
    expect(line.label).toBe("label");
    expect(line.mnemonic).toBe("");
    expect(line.symbolicOperands.length).toBe(0);
});

Deno.test("A label must only contain alphanumerics or underscore", () => {
    ["count bytes:", "count-bytes:", "count$bytes:", "count?bytes:"].forEach(
        (sourceCode) => {
            const line = dummyLine(false, 1);
            line.assemblySource = sourceCode;
            tokens(line);
            expect(line.failed()).toBe(true);
            expect (line.failures.length).toBe(1);
            const failure = line.failures[0]!;
           expect(failure.kind).toBe("syntax_invalidLabel");
        }
    );
    ["countBytes:", "count_bytes:", "count_8bit:"].forEach(
        (sourceCode) => {
            const line = dummyLine(false, 1);
            line.assemblySource = sourceCode;
            tokens(line);
            expect(line.failed()).toBe(false);
            expect(line.failures.length).toBe(0);
        }
    );
});
