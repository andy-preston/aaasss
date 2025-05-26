import { docTest, expectFileContents } from "../assembler/doc-test.ts";

Deno.test("Two register direct demo",() => {
    const demo = docTest();
    demo.source("", [
        '    {{ device("ATMega 328"); }}',
        "    ADIW R26, 5",
        "    SBIW R26, 57"
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATMega 328"); }}',
        "000000 96 15          2     ADIW R26, 5",
        "000001 97 D9          3     SBIW R26, 57",
        "",
        "Symbol Table",
        "============",
        "",
        "R26 |   |   | REGISTER | 2",
    ]);
    // This comes from the last version of GAVRAsm that I could get hold of.
    expectFileContents(".hex").toEqual([
        ":020000020000FC",
        ":040000001596D997E1",
        ":00000001FF"
    ]);
});
