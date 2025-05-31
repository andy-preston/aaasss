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
        "000000 0B 94          2     DES 0x00",
        "000001 1B 94          3     DES 0x01",
        "000002 2B 94          4     DES 0x02",
        "000003 3B 94          5     DES 0x03",
        "000004 4B 94          6     DES 0x04",
        "000005 5B 94          7     DES 0x05",
        "000006 6B 94          8     DES 0x06",
        "000007 7B 94          9     DES 0x07",
        "000008 8B 94         10     DES 0x08",
        "000009 9B 94         11     DES 0x09",
        "00000A AB 94         12     DES 0x0a",
        "00000B BB 94         13     DES 0x0b",
        "00000C CB 94         14     DES 0x0c",
        "00000D DB 94         15     DES 0x0d",
        "00000E EB 94         16     DES 0x0e",
        "00000F FB 94         17     DES 0x0f"
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
    expectFileExists(".hex").toBe(false);
});
