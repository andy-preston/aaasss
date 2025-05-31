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
        "000000 B1 F8          2     BLD R11, 1",
        "000001 C3 FA          3     BST R12, 3",
        "000002 43 FD          4     SBRC R20, 3",
        "000003 56 FF          5     SBRS R21, 6",
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
