import { assertEquals } from "assert";
import { assertFailureWithExtra } from "../coupling/value-failure-testing.ts";
import { addressedLine } from "../line-types/lines.ts";
import { assemblyLine, rawLine } from "../source-code/line-types.ts";
import { tokenisedLine } from "../tokenise/tokenised-line.ts";
import { pokeBuffer } from "./poke.ts";

const testLine = () => {
    const raw = rawLine("", 0, "", []);
    const assembly = assemblyLine(raw, "", []);
    const tokenised = tokenisedLine(assembly, "", "", [], []);
    return addressedLine(tokenised, 0, []);
};

Deno.test("You can poke bytes", () => {
    const poker = pokeBuffer();
    poker.directive([1, 2, 3, 4]);
    const result = poker.line(testLine());
    assertEquals(result.code, [[1, 2, 3, 4]]);
});

Deno.test("Poked bytes are grouped in sets of 4", () => {
    const poker = pokeBuffer();
    poker.directive([1, 2, 3, 4, 5, 6]);
    const result = poker.line(testLine());
    assertEquals(result.code, [[1, 2, 3, 4], [5, 6]]);
});

Deno.test("Poked bytes are padded to an even number", () => {
    const poker = pokeBuffer();
    poker.directive([1, 2, 3]);
    const firstResult = poker.line(testLine());
    assertEquals(firstResult.code, [[1, 2, 3, 0]]);
    poker.directive([1, 2, 3, 4, 5]);
    const secondResult = poker.line(testLine());
    assertEquals(secondResult.code, [[1, 2, 3, 4], [5, 0]]);
});

Deno.test("You can also poke ASCII strings", () => {
    const poker = pokeBuffer();
    poker.directive("Hello");
    const result = poker.line(testLine());
    assertEquals(result.code, [[72, 101, 108, 108], [111, 0]]);
});

Deno.test("... or UTF-8 strings", () => {
    const poker = pokeBuffer();
    poker.directive("ਕਿੱਦਾਂ");
    const result = poker.line(testLine());
    assertEquals(result.code, [
        [224, 168, 149, 224], [168, 191, 224, 169],
        [177, 224, 168, 166], [224, 168, 190, 224],
        [168, 130]
    ]);
});

Deno.test("Poked numbers must be bytes (0-255)", () => {
    const poker = pokeBuffer();
    const directiveResult = poker.directive([-1, 2, 300, 4]);
    assertFailureWithExtra(directiveResult, "byte.outOfRange", "-1, 300");
    const lineResult = poker.line(testLine());
    assertEquals(lineResult.code, [[2, 4]]);
});
