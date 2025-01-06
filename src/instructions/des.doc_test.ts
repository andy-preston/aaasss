import { assertEquals } from "assert";
import { testEnvironment } from "../pipeline/doc-test-environment.ts";

Deno.test("DES example code",() => {
    const environment = testEnvironment().deviceSpec({
        "unsupportedInstructions": { "value": [] },
        "programEnd": { "value": "0100" },
    }).source([
        '    {{ device("testing") }}',
        "    DES 15",
    ]);
    environment.pipeline();
    // The object code for these tests was cross-checked against last version
    // of GAVRAsm that I could get hold of.
    assertEquals(environment.listing(), [
        "mock.asm",
        "========",
        "",
        '                     1     {{ device("testing") }}',
        "00001 94 FB          2     DES 15",
    ]);
});

Deno.test("You need to specify a device before it can assemble",() => {
    const environment = testEnvironment().source([
        "    DES 15",
    ]);
    environment.pipeline();
    assertEquals(environment.listing(), [
        "mock.asm",
        "========",
        "",
        "                     1     DES 15",
        "                       mnemonic_supportedUnknown",
    ]);
    assertEquals(environment.hexFile(), undefined);
});

Deno.test("Some devices don't support DES",() => {
    const environment = testEnvironment().deviceSpec({
        "unsupportedInstructions": { "value": ["DES"] },
        "programEnd": { "value": "0100" },
    }).source([
        '    {{ device("testing") }}',
        "    DES 15",
    ]);
    environment.pipeline();
    assertEquals(environment.listing(), [
        "mock.asm",
        "========",
        "",
        '                     1     {{ device("testing") }}',
        "                     2     DES 15",
        "                       mnemonic_notSupported",
    ]);
    assertEquals(environment.hexFile(), undefined);
});


