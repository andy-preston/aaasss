import { assertFileContains, docTest } from "../assembler/doc-test.ts";

Deno.test("Macro demo", () => {
    const demo = docTest();
    demo.source([
        '    {{ device("ATTiny24"); }}',
        "",
        '    {{ define("aMacro", ["address"]); }}',
        "    LDS R30, address",
        "    {{ end(); }}",
        "",
        '    {{ macro("aMacro", [1024]); }}',
        '    {{ macro("aMacro", [2048]); }}',
    ]);
    demo.assemble();
    assertFileContains(".lst", [
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny24"); }}',
        "                      2",
        '                      3     {{ define("aMacro", ["address"]); }}',
        "                      4     LDS R30, address",
        "                      5     {{ end(); }}",
        "                      6",
        '                      7     {{ macro("aMacro", [1024]); }}',
        "000000 91 E0 04 00    7     LDS R30, address",
        '                      8     {{ macro("aMacro", [2048]); }}',
        "000002 91 E0 08 00    8     LDS R30, address"
    ]);
    assertFileContains(".hex", [
        ":020000020000FC",
        ":08000000E0910004E09100080A",
        ":00000001FF"
    ]);
});
