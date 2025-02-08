import { assertFileContains, docTest } from "../assembler/doc-test.ts";

Deno.test("Macro demo", () => {
    const demo = docTest();
    demo.source([
        '    {{ device("ATTiny24"); }}',
        "",
        '    {{ macro("aMacro", ["address"]); }}',
        "    LDS R30, address",
        "    {{ end(); }}",
        "",
        '    {{ aMacro(1024); }}',
        "",
        '    {{ aMacro(2048); }}',
    ]);
    demo.assemble();
    assertFileContains(".lst", [
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny24"); }}',
        "                      2",
        '                      3     {{ macro("aMacro", ["address"]); }}',
        "                      4     LDS R30, address",
        "                      5     {{ end(); }}",
        "                      6",
        '                      7     {{ aMacro(1024); }}',
        "000000 91 E0 04 00    7     LDS R30, address",
        '                      7     {{ end(); }}',
        "                      8",
        '                      9     {{ aMacro(2048); }}',
        "000002 91 E0 08 00    9     LDS R30, address",
        '                      9     {{ end(); }}',
        "",
        "Symbol Table",
        "============",
        "",
        "aMacro (2)",
        "R30 = 30 (2)"
    ]);
    assertFileContains(".hex", [
        ":020000020000FC",
        ":08000000E0910004E09100080A",
        ":00000001FF"
    ]);
});
