import { expect } from "jsr:@std/expect/expect";
import { testSystem } from "./testing.ts";

Deno.test("code is chunked into byte pairs", () => {
    const system = testSystem();
    system.objectCode.poke([1, 2, 3, 4]);
    expect(system.line.code.length).toBe(2);
    expect(system.line.code[0]).toEqual([1, 2]);
    expect(system.line.code[1]).toEqual([3, 4]);
});

Deno.test("an odd number of bytes is zero padded", () => {
    const system = testSystem();
    system.objectCode.poke([1, 2, 3, 4, 5]);
    expect(system.line.code.length).toBe(3);
    expect(system.line.code[0]).toEqual([1, 2]);
    expect(system.line.code[1]).toEqual([3, 4]);
    expect(system.line.code[2]).toEqual([5, 0]);
});
