import { assertEquals, assertNotEquals } from "assert";
import { docTest } from "../pipeline/doc-test.ts";

Deno.test("Device demo", () => {
    const demo = docTest().deviceSpec({
        "unsupportedInstructions": { "value": [] },
        "programEnd": { "value": "0100" },
        "reducedCore": { "value": false }
    }).source([
        '    {{ device("ATMega-328"); }}',
        "    LDS R30, 1024",
    ]);
    demo.assemble();
    assertEquals(demo.listing(), [
        "demo.asm",
        "========",
        '                      1     {{ device("ATMega-328"); }}',
        "000000 91 E0 04 00    2     LDS R30, 1024"
    ]);
    assertNotEquals(demo.hexFile(), undefined);
});

Deno.test("A device must be specified before any instructions can be assembled", () => {
    const demo = docTest().source([
        "    DES 23",
    ]);
    demo.assemble();
    assertEquals(demo.listing(), [
        "demo.asm",
        "========",
        "                      1     DES 23",
        "                        mnemonic_supportedUnknown",
    ]);
    assertEquals(demo.hexFile(), undefined);
});

Deno.test("The device name must be a string",() => {
    const demo = docTest().source([
        "    {{ device(testing); }}",
    ]);
    demo.assemble();
    assertEquals(demo.listing(), [
        "demo.asm",
        "========",
        "                      1     {{ device(testing); }}",
        "                        js_error",
        "                        ReferenceError",
        "                        testing is not defined",
    ]);
    assertEquals(demo.hexFile(), undefined);
});

