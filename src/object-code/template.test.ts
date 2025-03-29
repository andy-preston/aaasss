import { expect } from "jsr:@std/expect";
import { template } from "./template.ts";

Deno.test("A plain binary number is rendered as numbers", () => {
    const result = template("1111_0000 0000_1111", []);
    expect(result).toEqual([0xf0, 0x0f]);
});

Deno.test("Substitutions are substituted", () => {
    const result = template("dddd_rrrr rrrr_dddd", [
        ['d', 0xff],
        ['r', 0x00]
    ]);
    expect(result).toEqual([0xf0, 0x0f]);
});
