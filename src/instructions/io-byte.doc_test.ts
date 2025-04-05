import { docTest, expectFileContents, expectFileExists } from "../assembler/doc-test.ts";

Deno.test("IO Byte Demo", () => {
    const demo = docTest();
    demo.source([
        '    {{ device("ATTiny24"); }}',
        "    IN R19, 53 + 0x20",
        "    OUT 25 + 0x20, R16"
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny24"); }}',
        "000000 B7 35          2     IN R19, 53 + 0x20",
        "000001 BB 09          3     OUT 25 + 0x20, R16",
        "",
        "Symbol Table",
        "============",
        "",
        "R16 |   |   | REGISTER | 1",
        "R19 |   |   | REGISTER | 1"
    ]);
    // This comes from the last version of GAVRAsm that I could get hold of.
    expectFileContents(".hex").toEqual([
        ":020000020000FC",
        ":0400000035B709BB4C",
        ":00000001FF"
    ]);
});

Deno.test("Ports > 5F are out of range", () => {
    const demo = docTest();
    demo.source([
        '    {{ device("ATTiny24"); }}',
        "    IN R19, 0x60"
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny24"); }}',
        "000000 B1 30          2     IN R19, 0x60",
        "                        type_ioPort",
        "                        location.operand: 1",
        "                        value: 96",
        "                        min: 32",
        "                        max: 95",
        "",
        "Symbol Table",
        "============",
        "",
        "R19 |   |   | REGISTER | 1"
    ]);
    expectFileExists(".hex").toBeFalsy();
});
