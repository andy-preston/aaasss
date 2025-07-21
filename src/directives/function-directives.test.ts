import { expect } from "jsr:@std/expect";
import { complement, highByte, lowByte } from "./function-directives.ts";

Deno.test("lowByte splits a byte from a word", () => {
    expect(lowByte(0xcafe)).toBe(0xfe);
});

Deno.test("highByte splits a byte from a word", () => {
    expect(highByte(0xcafe)).toBe(0xca);
});

Deno.test("complement returns a positive value unchanged", () => {
    expect(complement(100)).toBe(100);
});

Deno.test("complement returns a two-complement of a negative value", () => {
    expect ((complement(-0b0101) as number).toString(2)).toBe("11111011");
});
