import { expect } from "jsr:@std/expect";
import { directiveFunction } from "../directives/directive-function.ts";
import { Failure, OldFailure } from "../failure/bags.ts";
import { pokeBuffer } from "./poke.ts";

const irrelevantName = "testing";

Deno.test("You can poke bytes", () => {
    const poker = pokeBuffer();
    const poke = directiveFunction(irrelevantName, poker.pokeDirective);

    expect(poke(1, 2, 3, 4).type).not.toBe("failures");
    expect(poker.contents()).toEqual([[1, 2, 3, 4]]);
});

Deno.test("Poked bytes are grouped in sets of 4", () => {
    const poker = pokeBuffer();
    const poke = directiveFunction(irrelevantName, poker.pokeDirective);

    expect(poke(1, 2, 3, 4, 5, 6).type).not.toBe("failures");
    expect(poker.contents()).toEqual([[1, 2, 3, 4], [5, 6]]);
});

Deno.test("Poked bytes are padded to an even number", () => {
    const poker = pokeBuffer();
    const poke = directiveFunction(irrelevantName, poker.pokeDirective);

    expect(poke(1, 2, 3).type).not.toBe("failures");
    expect(poker.contents()).toEqual([[1, 2, 3, 0]]);

    expect(poke(1, 2, 3, 4, 5).type).not.toBe("failures");
    expect(poker.contents()).toEqual([[1, 2, 3, 4], [5, 0]]);
});

Deno.test("You can also poke ASCII strings", () => {
    const poker = pokeBuffer();
    const poke = directiveFunction(irrelevantName, poker.pokeDirective);

    expect(poke("Hello").type).not.toBe("failures");
    expect(poker.contents()).toEqual([[72, 101, 108, 108], [111, 0]]);
});

Deno.test("... or UTF-8 strings", () => {
    const poker = pokeBuffer();
    const poke = directiveFunction(irrelevantName, poker.pokeDirective);

    expect(poke("ਕਿੱਦਾਂ").type).not.toBe("failures");
    expect(poker.contents()).toEqual([
        [224, 168, 149, 224], [168, 191, 224, 169],
        [177, 224, 168, 166], [224, 168, 190, 224],
        [168, 130]
    ]);
});

Deno.test("... or a combination of bytes and strings", () => {
    const poker = pokeBuffer();
    const poke = directiveFunction(irrelevantName, poker.pokeDirective);

    expect(poke(1, 2, 3, 4, "Hello").type).not.toBe("failures");
    expect(poker.contents()).toEqual([
        [1, 2, 3, 4],
        [72, 101, 108, 108], [111, 0]
    ]);
})

Deno.test("Poked numbers must be bytes (0-255)", () => {
    const poker = pokeBuffer();
    const poke = directiveFunction(irrelevantName, poker.pokeDirective);

    const result = poke(-1, 2, 300, 4);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as OldFailure;
    expect (failure.kind).toBe("type_bytes");
    expect(failure.extra).toEqual(["-1", "300"]);

    expect(poker.contents()).toEqual([[2, 4]]);
});
