import { docTest, expectFileContents } from "../assembler/doc-test.ts";

Deno.test("Single Register Bit Demo", () => {
    const demo = docTest();
    demo.source("", [
        '    {{ device("ATTiny24"); }}',
        "    BLD R11, 1",
        "    BST R12, 3",
        "    SBRC R20, 3",
        "    SBRS R21, 6",
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny24"); }}',
        "000000 F8 B1          2     BLD R11, 1",
        "000001 FA C3          3     BST R12, 3",
        "000002 FD 43          4     SBRC R20, 3",
        "000003 FF 56          5     SBRS R21, 6",
        "",
        "Symbol Table",
        "============",
        "",
        "R11 |   |   | REGISTER | 1",
        "R12 |   |   | REGISTER | 1",
        "R20 |   |   | REGISTER | 1",
        "R21 |   |   | REGISTER | 1"
    ]);
    expectFileContents(".hex").toEqual([
        ":020000020000FC",
        ":08000000B1F8C3FA43FD56FFFD",
        ":00000001FF",
    ]);
});
