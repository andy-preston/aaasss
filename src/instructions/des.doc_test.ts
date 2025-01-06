import { assertEquals } from "assert";
import { testEnvironment } from "../pipeline/doc-test-environment.ts";

Deno.test("DES example code",() => {
    const environment = testEnvironment().deviceSpec({
        "unsupportedInstructions": { "value": [] },
        "programEnd": { "value": "0100" }
    }).source([
        '    {{ device("testing") }}',
        "    DES 0x00",
        "    DES 0x01",
        "    DES 0x02",
        "    DES 0x03",
        "    DES 0x04",
        "    DES 0x05",
        "    DES 0x06",
        "    DES 0x07",
        "    DES 0x08",
        "    DES 0x09",
        "    DES 0x0a",
        "    DES 0x0b",
        "    DES 0x0c",
        "    DES 0x0d",
        "    DES 0x0e",
        "    DES 0x0f",
    ]);
    environment.assemble();
    assertEquals(environment.listing(), [
        "mock.asm",
        "========",
        '                      1     {{ device("testing") }}',
        "000000 94 0B          2     DES 0x00",
        "000001 94 1B          3     DES 0x01",
        "000002 94 2B          4     DES 0x02",
        "000003 94 3B          5     DES 0x03",
        "000004 94 4B          6     DES 0x04",
        "000005 94 5B          7     DES 0x05",
        "000006 94 6B          8     DES 0x06",
        "000007 94 7B          9     DES 0x07",
        "000008 94 8B         10     DES 0x08",
        "000009 94 9B         11     DES 0x09",
        "00000A 94 AB         12     DES 0x0a",
        "00000B 94 BB         13     DES 0x0b",
        "00000C 94 CB         14     DES 0x0c",
        "00000D 94 DB         15     DES 0x0d",
        "00000E 94 EB         16     DES 0x0e",
        "00000F 94 FB         17     DES 0x0f"
    ]);
    // The comes from the last version of GAVRAsm that I could get hold of.
    assertEquals(environment.hexFile(), [
        ":020000020000FC",
        ":100000000B941B942B943B944B945B946B947B9438",
        ":100010008B949B94AB94BB94CB94DB94EB94FB9428",
        ":00000001FF"
    ]);
});

Deno.test("You need to specify a device before it can assemble",() => {
    const environment = testEnvironment().source([
        "    DES 15",
    ]);
    environment.assemble();
    assertEquals(environment.listing(), [
        "mock.asm",
        "========",
        "                      1     DES 15",
        "                        mnemonic_supportedUnknown",
    ]);
    assertEquals(environment.hexFile(), undefined);
});

Deno.test("Some devices don't support DES",() => {
    const environment = testEnvironment().deviceSpec({
        "unsupportedInstructions": { "value": ["DES"] },
        "programEnd": { "value": "0100" }
    }).source([
        '    {{ device("testing") }}',
        "    DES 15",
    ]);
    environment.assemble();
    assertEquals(environment.listing(), [
        "mock.asm",
        "========",
        '                      1     {{ device("testing") }}',
        "                      2     DES 15",
        "                        mnemonic_notSupported",
    ]);
    assertEquals(environment.hexFile(), undefined);
});


