import { assertEquals } from "assert";
import { assertFailureWithExtra } from "../failure/testing.ts";
import { pokeBuffer } from "./poke.ts";

Deno.test("You can poke bytes", () => {
    const poker = pokeBuffer();
    poker.pokeDirective.body([1, 2, 3, 4]);
    assertEquals(poker.contents(), [[1, 2, 3, 4]]);
});

Deno.test("Poked bytes are grouped in sets of 4", () => {
    const poker = pokeBuffer();
    poker.pokeDirective.body([1, 2, 3, 4, 5, 6]);
    assertEquals(poker.contents(), [[1, 2, 3, 4], [5, 6]]);
});

Deno.test("Poked bytes are padded to an even number", () => {
    const poker = pokeBuffer();
    poker.pokeDirective.body([1, 2, 3]);
    assertEquals(poker.contents(), [[1, 2, 3, 0]]);
    poker.pokeDirective.body([1, 2, 3, 4, 5]);
    assertEquals(poker.contents(), [[1, 2, 3, 4], [5, 0]]);
});

Deno.test("You can also poke ASCII strings", () => {
    const poker = pokeBuffer();
    poker.pokeDirective.body(["Hello"]);
    assertEquals(poker.contents(), [[72, 101, 108, 108], [111, 0]]);
});

Deno.test("... or UTF-8 strings", () => {
    const poker = pokeBuffer();
    poker.pokeDirective.body(["ਕਿੱਦਾਂ"]);
    assertEquals(poker.contents(), [
        [224, 168, 149, 224], [168, 191, 224, 169],
        [177, 224, 168, 166], [224, 168, 190, 224],
        [168, 130]
    ]);
});

Deno.test("... or a combination of bytes and strings", () => {
    const poker = pokeBuffer();
    poker.pokeDirective.body([1, 2, 3, 4, "Hello"]);
    assertEquals(poker.contents(), [
        [1, 2, 3, 4],
        [72, 101, 108, 108],
        [111, 0]
    ]);
})

Deno.test("Poked numbers must be bytes (0-255)", () => {
    const poker = pokeBuffer();
    const result = poker.pokeDirective.body([-1, 2, 300, 4]);
    assertFailureWithExtra(result, "type_bytes", ["-1", "300"]);
    assertEquals(poker.contents(), [[2, 4]]);
});
