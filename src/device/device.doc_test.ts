import { docTest } from "../assembler/doc-test.ts";

Deno.test("Device demo", () => {
    const demo = docTest();
    demo.source([
        '    {{ device("ATTiny24"); }}',
        "    LDS R30, 1024",
    ]);
    demo.assemble();
    demo.assertFileContains(".lst", [
        "demo.asm",
        "========",
        '                      1     {{ device("ATTiny24"); }}',
        "000000 91 E0 04 00    2     LDS R30, 1024"
    ]);
    demo.assertFileExists(".hex");
});

Deno.test("A device must be specified before any instructions can be assembled", () => {
    const demo = docTest();
    demo.source([
        "    DES 23",
    ]);
    demo.assemble();
    demo.assertFileContains(".lst", [
        "demo.asm",
        "========",
        "                      1     DES 23",
        "                        mnemonic_supportedUnknown",
    ]);
    demo.assertNoFileExists(".hex");
});

Deno.test("The device name must be a string",() => {
    const demo = docTest();
    demo.source([
        "    {{ device(ATTiny24); }}",
    ]);
    demo.assemble();
    demo.assertFileContains(".lst", [
        "demo.asm",
        "========",
        "                      1     {{ device(ATTiny24); }}",
        "                        js_error",
        "                        ReferenceError",
        "                        ATTiny24 is not defined",
    ]);
    demo.assertNoFileExists(".hex");
});
