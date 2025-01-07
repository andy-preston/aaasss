import { assertEquals } from "assert/equals";
import { testEnvironment } from "../pipeline/doc-test-environment.ts";
import { assertNotEquals } from "assert";

Deno.test("Device demo", () => {
    const environment = testEnvironment().deviceSpec({
        "unsupportedInstructions": { "value": [] },
        "programEnd": { "value": "0100" },
        "reducedCore": { "value": false }
    }).source([
        '    {{ device("ATMega-328"); }}',
        "    LDS R30, 1024",
    ]);
    environment.assemble();
    assertEquals(environment.listing(), [
        "demo.asm",
        "========",
        '                      1     {{ device("ATMega-328"); }}',
        "000000 91 E0 04 00    2     LDS R30, 1024"
    ]);
    assertNotEquals(environment.hexFile(), undefined);
});

Deno.test("A device must be specified before any instructions can be assembled", () => {
    const environment = testEnvironment().source([
        "    DES 23",
    ]);
    environment.assemble();
    assertEquals(environment.listing(), [
        "demo.asm",
        "========",
        "                      1     DES 23",
        "                        mnemonic_supportedUnknown",
    ]);
    assertEquals(environment.hexFile(), undefined);
});

Deno.test("The device name must be a string",() => {
    const environment = testEnvironment().source([
        "    {{ device(testing); }}",
    ]);
    environment.assemble();
    assertEquals(environment.listing(), [
        "demo.asm",
        "========",
        "                      1     {{ device(testing); }}",
        "                        js_error",
        "                        ReferenceError",
        "                        testing is not defined",
    ]);
    assertEquals(environment.hexFile(), undefined);
});

