import type { Failure, NumericTypeFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect/expect";
import { systemUnderTest } from "./testing.ts";

Deno.test("You can poke bytes", () => {
    const system = systemUnderTest();
    expect(system.poke(1, 2, 3, 4).type).not.toBe("failures");
    expect(system.line.code).toEqual([[1, 2], [3, 4]]);
});

Deno.test("Poked bytes are grouped in sets of 4", () => {
    const system = systemUnderTest();
    expect(system.poke(1, 2, 3, 4, 5, 6).type).not.toBe("failures");
    expect(system.line.code).toEqual([[1, 2], [3, 4], [5, 6]]);
});

Deno.test("Poked bytes are padded to an even number", () => {
    {
        const system = systemUnderTest();
        expect(system.poke(1, 2, 3).type).not.toBe("failures");
        expect(system.line.code).toEqual([[1, 2], [3, 0]]);
    } {
        const system = systemUnderTest();
        expect(system.poke(1, 2, 3, 4, 5).type).not.toBe("failures");
        expect(system.line.code).toEqual([[1, 2], [3, 4], [5, 0]]);
    }
});

Deno.test("You can also poke ASCII strings", () => {
    const system = systemUnderTest();
    expect(system.poke("Hello").type).not.toBe("failures");
    expect(system.line.code).toEqual([
        [72, 101], [108, 108], [111, 0]
    ]);
});

Deno.test("... or UTF-8 strings", () => {
    const system = systemUnderTest();
    expect(system.poke("ਕਿੱਦਾਂ").type).not.toBe("failures");
    expect(system.line.code).toEqual([
        [224, 168], [149, 224], [168, 191], [224, 169],
        [177, 224], [168, 166], [224, 168], [190, 224], [168, 130]
    ]);
});

Deno.test("... or a combination of bytes and strings", () => {
    const system = systemUnderTest();
    expect(system.poke(1, 2, 3, 4, "Hello").type).not.toBe("failures");
    expect(system.line.code).toEqual([
        [1, 2], [3, 4], [72, 101], [108, 108], [111, 0]
    ]);
})

Deno.test("Poked numbers must be bytes (0-255)", () => {
    const system = systemUnderTest();
    const result = system.poke(-1, 2, 300, 4);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(2);
    {
        const failure = failures[0] as NumericTypeFailure;
        expect(failure.kind).toBe("type_bytesOrString");
        expect(failure.location).toEqual({"parameter": 0});
        expect(failure.value).toBe(-1);
    } {
        const failure = failures[1] as NumericTypeFailure;
        expect(failure.kind).toBe("type_bytesOrString");
        expect(failure.location).toEqual({"parameter": 2});
        expect(failure.value).toBe(300);
    }
    expect(system.line.code).toEqual([[2, 4]]);
});
