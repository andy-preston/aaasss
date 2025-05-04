import { docTest, expectFileContents } from "../assembler/doc-test.ts";

Deno.test("Macro demo", () => {
    const demo = docTest();
    demo.source([
        '    {{ device("ATTiny24"); }}',
        "",
        '    {{ macro("aMacro", "address"); }}',
        "    LDS R30, address",
        "    {{ end(); }}",
        "",
        '    {{ aMacro(1024); }}',
        "",
        '    {{ aMacro(2048); }}',
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny24"); }}',
        "                      2",
        '                      3     {{ macro("aMacro", "address"); }}',
        "                      4     LDS R30, address",
        "                      5     {{ end(); }}",
        "                      6",
        '                      7     {{ aMacro(1024); }}',
        "000000 91 E0 04 00    7     LDS R30, address",
        "                      8",
        '                      9     {{ aMacro(2048); }}',
        "000002 91 E0 08 00    9     LDS R30, address",
        "",
        "Symbol Table",
        "============",
        "",
        "aMacro |   |   | /var/tmp/demo.asm:5 | 2",
        "R30    |   |   | REGISTER            | 2"
    ]);
    expectFileContents(".hex").toEqual([
        ":020000020000FC",
        ":08000000E0910004E09100080A",
        ":00000001FF"
    ]);
});

Deno.test("Playing back multiple copies of a macro with JS", () => {
    const demo = docTest();
    demo.source([
        '    {{ device("ATTiny24"); }}',
        "",
        '    {{ macro("aMacro", "address"); }}',
        "    LDS R30, address",
        "    {{ end(); }}",
        "",
        "    {{ [2048, 1024].forEach(a => aMacro(a)); }}",
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny24"); }}',
        "                      2",
        '                      3     {{ macro("aMacro", "address"); }}',
        "                      4     LDS R30, address",
        "                      5     {{ end(); }}",
        "                      6",
        "                      7     {{ [2048, 1024].forEach(a => aMacro(a)); }}",
        "000000 91 E0 04 00    7     LDS R30, address",
        "000002 91 E0 08 00    7     LDS R30, address",
        "",
        "Symbol Table",
        "============",
        "",
        "aMacro |   |   | /var/tmp/demo.asm:5 | 2",
        "R30    |   |   | REGISTER            | 2"
    ]);
    expectFileContents(".hex").toEqual([
        ":020000020000FC",
        ":08000000E0910004E09100080A",
        ":00000001FF"
    ]);
});

Deno.test("A macro can be called from inside another macro", () => {
    const demo = docTest();
    demo.source([
        '    {{ device("ATTiny24"); }}',
        "",
        '    {{ macro("innerMacro", "address"); }}',
        "    LDS R30, address",
        "    {{ end(); }}",
        "",
        '    {{ macro("outerMacro"); }}',
        '    {{ innerMacro(1024); }}',
        '    {{ innerMacro(2048); }}',
        "    {{ end(); }}",
        "",
        "    {{ outerMacro() }}"

    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny24"); }}',
        "                      2",
        '                      3     {{ macro("innerMacro", "address"); }}',
        "                      4     LDS R30, address",
        "                      5     {{ end(); }}",
        "                      6",
        '                      7     {{ macro("outerMacro"); }}',
        "                      8     {{ innerMacro(1024); }}",
        "                      9     {{ innerMacro(2048); }}",
        "                     10     {{ end(); }}",
        "                     11",
        "                     12     {{ outerMacro() }}",
        "                     12     {{ innerMacro(1024); }}",
        "000000 91 E0 04 00   12     LDS R30, address",
        "                     12     {{ innerMacro(2048); }}",
        "000002 91 E0 08 00   12     LDS R30, address",
        "",
        "Symbol Table",
        "============",
        "",
        "innerMacro |   |   | /var/tmp/demo.asm:5  | 4",
        "outerMacro |   |   | /var/tmp/demo.asm:10 | 1",
        "R30        |   |   | REGISTER             | 2"
    ]);
    expectFileContents(".hex").toEqual([
        ":020000020000FC",
        ":08000000E0910004E09100080A",
        ":00000001FF"
    ]);
});
