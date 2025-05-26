import { docTest, expectFileContents } from "../assembler/doc-test.ts";

Deno.test("Macro demo", () => {
    const demo = docTest();
    demo.source("", [
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
    demo.source("", [
        '    {{ device("ATTiny24"); }}',
        "",
        '    {{ macro("aMacro", "address"); }}',
        "    LDS R30, address",
        "    {{ end(); }}",
        "",
        "    {{ [1024, 2048].reverse().forEach(a => aMacro(a)); }}",
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
        "                      7     {{ [1024, 2048].reverse().forEach(a => aMacro(a)); }}",
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
    demo.source("", [
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

Deno.test("Any JS in a macro is executed during definition and playback but andy code it may generate is discarded", () => {
    const demo = docTest();
    demo.source("", [
        '    {{ device("ATTiny24"); }}',
        "",
        '    {{ macro("pokingMacro"); }}',
        '    {{ poke("testing"); }}',
        "    LDI R30, 23",
        "    {{ end(); }}",
        "",
        "    {{ pokingMacro() }}"

    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny24"); }}',
        "                      2",
        '                      3     {{ macro("pokingMacro"); }}',
        '                      4     {{ poke("testing"); }}',
        "                      5     LDI R30, 23",
        "                      6     {{ end(); }}",
        "                      7",
        "                      8     {{ pokingMacro() }}",
        '000004 74 65 73 74    8     {{ poke("testing"); }}',
        "000006 69 6E 67 00",
        "000008 E1 E7          8     LDI R30, 23",
        "",
        "Symbol Table",
        "============",
        "",
        "pokingMacro |   |   | /var/tmp/demo.asm:6 | 1",
        "R30         |   |   | REGISTER            | 1"
    ]);
});

Deno.test("A macro can be defined in one file and used in another", () => {
    const demo = docTest();
    demo.source("def.asm", [
        '    {{ macro("aMacro", "address"); }}',
        "    LDS R30, address",
        "    {{ end(); }}",
    ]);
    demo.source("", [
        '    {{ device("ATTiny24"); }}',
        '    {{ include("/var/tmp/def.asm"); }}',
        '    {{ aMacro(1024); }}',
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny24"); }}',
        '                      2     {{ include("/var/tmp/def.asm"); }}',
        "",
        "/var/tmp/def.asm",
        "================",
        '                      1     {{ macro("aMacro", "address"); }}',
        "                      2     LDS R30, address",
        "                      3     {{ end(); }}",
        "",
        "/var/tmp/demo.asm",
        "=================",
        "                      3     {{ aMacro(1024); }}",
        "000000 91 E0 04 00    3     LDS R30, address",
        "",
        "Symbol Table",
        "============",
        "",
        "aMacro |   |   | /var/tmp/def.asm:3 | 1",
        "R30    |   |   | REGISTER           | 1"
    ]);
});
