import type { Pass } from "../assembler/data-types.ts";
import type { ImmutableLine } from "../line/line-types.ts";

import { expect } from "jsr:@std/expect";
import { numberBag } from "../assembler/bags.ts";
import { line } from "../line/line-types.ts";
import { systemUnderTest, testDirectives } from "./testing.ts";

const testPipeline = function* (pass: Pass) {
    yield line("", 0, "", "", 0, true).withPass(pass) as ImmutableLine;
};

Deno.test("The symbol table is reset at the end of the first pass", () => {
    const system = systemUnderTest();
    const directives = testDirectives(system);

    const define = directives.define("plop", 57);
    expect(define.type).not.toBe("failures");
    [1, 2, 3].forEach(expectedCount => {
        const use = system.symbolTable.use("plop");
        expect(use).toEqual(numberBag(57));
        expect(system.symbolTable.count("plop")).toBe(expectedCount);
    })
    const pipeline = system.symbolTablePipeline.assemblyPipeline(
        testPipeline(1)
    );
    [...pipeline];
    expect(system.symbolTable.count("plop")).toEqual(0);
});

Deno.test("... but left intact at the end of the second pass", () => {
    const system = systemUnderTest();
    const directives = testDirectives(system);

    const define = directives.define("plop", 57);
    expect(define.type).not.toBe("failures");
    [1, 2, 3].forEach(expectedCount => {
        const use = system.symbolTable.use("plop");
        expect(use).toEqual(numberBag(57));
        expect(system.symbolTable.count("plop")).toBe(expectedCount);
    })
    const pipeline = system.symbolTablePipeline.assemblyPipeline(
        testPipeline(2)
    );
    [...pipeline];
    expect(system.symbolTable.count("plop")).toEqual(3);
});
