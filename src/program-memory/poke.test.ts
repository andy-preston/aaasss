import { assertEquals } from "assert";
import { lineWithRenderedJavascript } from "../javascript/embedded/line-types.ts";
import { lineWithOperands } from "../javascript/expressions/line-types.ts";
import { assertFailureWithExtra } from "../failure/testing.ts";
import { lineWithProcessedMacro } from "../macro/line-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { lineWithAddress} from "./line-types.ts";
import { pokeBuffer } from "./poke.ts";

const testLine = () => {
    const raw = lineWithRawSource("", 0, false, "");
    const rendered = lineWithRenderedJavascript(raw, "");
    const tokenised = lineWithTokens(rendered, "", "", []);
    const processed = lineWithProcessedMacro(tokenised, "");
    const addressed = lineWithAddress(processed, 0);
    return lineWithOperands(addressed, []);
};

Deno.test("You can poke bytes", () => {
    const poker = pokeBuffer();
    poker.poke([1, 2, 3, 4]);
    const result = poker.line(testLine());
    assertEquals(result.code, [[1, 2, 3, 4]]);
});

Deno.test("Poked bytes are grouped in sets of 4", () => {
    const poker = pokeBuffer();
    poker.poke([1, 2, 3, 4, 5, 6]);
    const result = poker.line(testLine());
    assertEquals(result.code, [[1, 2, 3, 4], [5, 6]]);
});

Deno.test("Poked bytes are padded to an even number", () => {
    const poker = pokeBuffer();
    poker.poke([1, 2, 3]);
    const firstResult = poker.line(testLine());
    assertEquals(firstResult.code, [[1, 2, 3, 0]]);
    poker.poke([1, 2, 3, 4, 5]);
    const secondResult = poker.line(testLine());
    assertEquals(secondResult.code, [[1, 2, 3, 4], [5, 0]]);
});

Deno.test("You can also poke ASCII strings", () => {
    const poker = pokeBuffer();
    poker.poke("Hello");
    const result = poker.line(testLine());
    assertEquals(result.code, [[72, 101, 108, 108], [111, 0]]);
});

Deno.test("... or UTF-8 strings", () => {
    const poker = pokeBuffer();
    poker.poke("ਕਿੱਦਾਂ");
    const result = poker.line(testLine());
    assertEquals(result.code, [
        [224, 168, 149, 224], [168, 191, 224, 169],
        [177, 224, 168, 166], [224, 168, 190, 224],
        [168, 130]
    ]);
});

Deno.test("Poked numbers must be bytes (0-255)", () => {
    const poker = pokeBuffer();
    const pokeResult = poker.poke([-1, 2, 300, 4]);
    assertFailureWithExtra(pokeResult, "type_bytes", "-1, 300");
    const lineResult = poker.line(testLine());
    assertEquals(lineResult.code, [[2, 4]]);
});
