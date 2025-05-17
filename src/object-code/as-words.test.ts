import { expect } from "jsr:@std/expect";
import { codeAsWords } from "./as-words.ts";

Deno.test("code is chunked into byte pairs", () => {
    const [...result] = codeAsWords([1, 2, 3, 4].values());
    expect(result.length).toBe(2);
    expect(result[0]).toEqual([1, 2]);
    expect(result[1]).toEqual([3, 4]);
});

Deno.test("an odd number of bytes is zero padded", () => {
    const [...result] = codeAsWords([1, 2, 3, 4, 5].values());
    expect(result.length).toBe(3);
    expect(result[0]).toEqual([1, 2]);
    expect(result[1]).toEqual([3, 4]);
    expect(result[2]).toEqual([5, 0]);
});

Deno.test("it can consume from a generator", () => {
    const bytes = function* (): Generator<number, void, void> {
        for (const byte of [1, 2, 3, 4, 5]) {
            yield byte;
        }
    };
    const [...result] = codeAsWords(bytes());
    expect(result.length).toBe(3);
    expect(result[0]).toEqual([1, 2]);
    expect(result[1]).toEqual([3, 4]);
    expect(result[2]).toEqual([5, 0]);
});
