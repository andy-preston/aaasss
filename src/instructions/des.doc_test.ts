import { docTest, expectFileContents, expectFileExists } from "../assembler/doc-test.ts";

Deno.test("DES example code",() => {
    const demo = docTest();
    demo.mockUnsupportedDevice({
        "unsupportedInstructions": [],
        "programMemoryBytes": 0x0100
    });
    demo.source("", [
        '    {{ device("testing"); }}',
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
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("testing"); }}',
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
    // This comes from the last version of GAVRAsm that I could get hold of.
    expectFileContents(".hex").toEqual([
        ":020000020000FC",
        ":100000000B941B942B943B944B945B946B947B9438",
        ":100010008B949B94AB94BB94CB94DB94EB94FB9428",
        ":00000001FF"
    ]);
});

Deno.test("Some(most?) devices don't support DES",() => {
    const demo = docTest();
    demo.source("", [
        '    {{ device("AT-Tiny-24"); }}',
        "    DES 15",
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("AT-Tiny-24"); }}',
        "                      2     DES 15",
        "                        notSupported_mnemonic",
        "                        used: DES"
    ]);
    expectFileExists(".hex").toBeFalsy();
});
