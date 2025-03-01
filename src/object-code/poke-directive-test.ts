import { assertEquals, assertFalse } from "assert";
import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { directiveList } from "../directives/directive-list.ts";
import { embeddedJs } from "../javascript/embedded.ts";
import { jSExpression } from "../javascript/expression.ts";
import { pokeBuffer } from "./poke.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";

const dummyFileName = "";
const dummyLineNumber = 0;
const noMacroName = "";
const noMacroCount = 0;
const notLastLine = false;

const testLine = (source: string) => lineWithRawSource(
    dummyFileName, dummyLineNumber,
    source,
    noMacroName, noMacroCount, notLastLine
);

const systemUnderTest = () => {
    const directives = directiveList();
    const poke = pokeBuffer();
    directives.includes("poke", poke.pokeDirective);
    const symbols = symbolTable(
        directives, deviceProperties().public, cpuRegisters(), pass()
    );
    return {
        "pokeBuffer": poke,
        "embeddedJs": embeddedJs(jSExpression(symbols))
    };
};

Deno.test("You can also poke ASCII strings", () => {
    const system = systemUnderTest();
    const result = system.embeddedJs.rendered(testLine(
        '{{ poke("Hello"); }}'
    ));
    assertFalse(result.failed);
    assertEquals(system.pokeBuffer.contents(), [
        [72, 101, 108, 108], [111, 0]
    ]);
});

Deno.test("... or UTF-8 strings", () => {
    const system = systemUnderTest();
    const result = system.embeddedJs.rendered(testLine(
        '{{ poke("ਕਿੱਦਾਂ"); }}'
    ));
    assertFalse(result.failed);
    assertEquals(system.pokeBuffer.contents(), [
        [224, 168, 149, 224], [168, 191, 224, 169],
        [177, 224, 168, 166], [224, 168, 190, 224],
        [168, 130]
    ]);
});

Deno.test("You can also poke a combination of data", () => {
    const system = systemUnderTest();
    const result = system.embeddedJs.rendered(testLine(
        '{{ poke(1, 2, 3, "Hello", 4, 5, 6); }}'
    ));
    assertFalse(result.failed);
    assertEquals(system.pokeBuffer.contents(), [
        [1, 2, 3, 72], [101, 108, 108, 111], [4, 5, 6, 0]
    ]);
});
