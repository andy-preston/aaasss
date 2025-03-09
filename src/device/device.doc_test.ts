import { assertFileContains, assertFileExists, assertNoFileExists, docTest } from "../assembler/doc-test.ts";

Deno.test("Device demo", () => {
    const demo = docTest();
    demo.source([
        '    {{ device("ATTiny24"); }}',
        "    LDS R30, 1024",
    ]);
    demo.assemble();
    assertFileContains(".lst", [
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny24"); }}',
        "000000 91 E0 04 00    2     LDS R30, 1024",
        "",
        "Symbol Table",
        "============",
        "",
        "R30 (1)"
    ]);
    assertFileExists(".hex");
});

Deno.test("A device must be specified before any instructions can be assembled", () => {
    const demo = docTest();
    demo.source([
        "    DES 23",
    ]);
    demo.assemble();
    assertFileContains(".lst", [
        "/var/tmp/demo.asm",
        "=================",
        "                      1     DES 23",
        "                        device_notSelected",
        "                        mnemonic_supportedUnknown",
        "                        clue: DES"
    ]);
    assertNoFileExists(".hex");
});

Deno.test("The device name must be a string",() => {
    const demo = docTest();
    demo.source([
        "    {{ device(ATTiny24); }}",
    ]);
    demo.assemble();
    assertFileContains(".lst", [
        "/var/tmp/demo.asm",
        "=================",
        "                      1     {{ device(ATTiny24); }}",
        "                        js_error",
        "                        extra[0]: ReferenceError",
        "                        extra[1]: ATTiny24 is not defined",
    ]);
    assertNoFileExists(".hex");
});
