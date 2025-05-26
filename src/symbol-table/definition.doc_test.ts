import { docTest, expectFileContents, expectFileExists } from "../assembler/doc-test.ts";

Deno.test("Definition errors give the location of the original definition", () => {
    const demo = docTest();
    demo.source("", [
        '      {{ device("ATTiny24"); }}',
        "plop: BLD R11, 1",
        "plop: BST R12, 3",
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1       {{ device("ATTiny24"); }}',
        "000000 F8 B1          2 plop: BLD R11, 1",
        "000001 FA C3          3 plop: BST R12, 3",
        "                        symbol_alreadyExists",
        "                        name: plop",
        "                        definition: /var/tmp/demo.asm:2",
        "",
        "Symbol Table",
        "============",
        "",
        "plop | 0 | 0 | /var/tmp/demo.asm:2 | 0",
        "R11  |   |   | REGISTER            | 1",
        "R12  |   |   | REGISTER            | 1"
    ]);
    expectFileExists(".hex").toBe(false);
});
