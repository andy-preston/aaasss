import { expect } from "jsr:@std/expect";
import { template } from "./template.ts";

const asBinary = (bytes: Array<number>) =>
    bytes.map(byte => byte.toString(2).padStart(8, "0"));

Deno.test("A plain binary number is rendered as numbers", () => {
    const result = template("1111_0000 0000_1111", {});
    expect(result).toEqual([0xf0, 0x0f]);
});

Deno.test("Substitutions are substituted", () => {
    const result = template("dddd_ssss ssss_dddd", {"d": 0xff, "s": 0x00});
    expect(result).toEqual([0xf0, 0x0f]);
});

Deno.test("Bit order of substitutions is 'natural'", () => {
    const result = asBinary(
        template("dddd_dddd 0000_0000", {"d": 0b01010011})
    );
    expect(result[0]).toBe("01010011");
});

Deno.test("Bit order of substitutions is 'natural' across byte boundaries", () => {
    const result = asBinary(
        template("1111_dddd dddd_0000", {"d": 0b01010011})
    );
    expect(result[0]).toBe("11110101");
    expect(result[1]).toBe("00110000");
});
