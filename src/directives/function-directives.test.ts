import { expect } from "jsr:@std/expect";
import { currentLine } from "../line/current-line.ts";
import { emptyLine } from "../line/line-types.ts";
import { functionDirectives } from "./function-directives.ts";

const testSystem = () => {
    const $currentLine = currentLine();
    $currentLine(emptyLine("plop.asm"));
    const $functionDirectives = functionDirectives($currentLine);
    return {
        "currentLine": $currentLine,
        "functionDirectives": $functionDirectives
    };
}

Deno.test("low splits a byte from a word", () => {
    const systemUnderTest = testSystem();
    expect(systemUnderTest.functionDirectives.low(0xcafe)).toBe(0xfe);
});

Deno.test("low doesn't accept negative values", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.functionDirectives.low(-1);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "parameter_value", "location": undefined,
        "expected": "(word) 0-FFFF", "actual": "-1"
    }]);
});

Deno.test("low doesn't accept values bigger than a word", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.functionDirectives.low(0xffffff);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "parameter_value", "location": undefined,
        "expected": "(word) 0-FFFF", "actual": `${0xffffff}`
    }]);
});

Deno.test("high splits a byte from a word", () => {
    const systemUnderTest = testSystem();
    expect(systemUnderTest.functionDirectives.high(0xcafe)).toBe(0xca);
});

Deno.test("high doesn't accept negative values", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.functionDirectives.high(-1);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "parameter_value", "location": undefined,
        "expected": "(word) 0-FFFF", "actual": "-1"
    }]);
});

Deno.test("high doesn't accept values bigger than a word", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.functionDirectives.high(0xffffff);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "parameter_value", "location": undefined,
        "expected": "(word) 0-FFFF", "actual": `${0xffffff}`
    }]);
});

Deno.test("complement returns a positive value unchanged", () => {
    const systemUnderTest = testSystem();
    expect(systemUnderTest.functionDirectives.complement(100)).toBe(100);
});

Deno.test("complement returns a two-complement of a negative value", () => {
    const systemUnderTest = testSystem();
    const result = systemUnderTest.functionDirectives.complement(-0b0101);
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect ((result as number).toString(2)).toBe("11111011");
});

Deno.test("complement doesn't accept anything smaller than -128", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.functionDirectives.complement(-200);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "parameter_value", "location": undefined,
        "expected": "(signed byte) (-128)-127", "actual": "-200"
    }]);
});

Deno.test("complement doesn't accept anything larger than 127", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.functionDirectives.complement(200);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "parameter_value", "location": undefined,
        "expected": "(signed byte) (-128)-127", "actual": "200"
    }]);
});
