import { docTest, expectFileContents, expectFileExists } from "../assembler/doc-test.ts";

Deno.test("Device demo", () => {
    const demo = docTest();
    demo.source([
        '    {{ device("ATTiny24"); }}',
        "    LDS R30, 1024",
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny24"); }}',
        "000000 91 E0 04 00    2     LDS R30, 1024",
        "",
        "Symbol Table",
        "============",
        "",
        "R30 |   |   | REGISTER | 1"
    ]);
    expectFileExists(".hex").toBeTruthy();
});

Deno.test("A device must be specified before any instructions can be assembled", () => {
    const demo = docTest();
    demo.source([
        "    DES 23",
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        "                      1     DES 23",
        "                        device_notSelected",
        "                        mnemonic_supportedUnknown",
        "                        clue: DES"
    ]);
    expectFileExists(".hex").toBeFalsy();
});

Deno.test("The device name must be a string",() => {
    const demo = docTest();
    demo.source([
        "    {{ device(ATTiny24); }}",
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        "                      1     {{ device(ATTiny24); }}",
        "                        js_error",
        "                        exception: ReferenceError",
        "                        message: ATTiny24 is not defined",
    ]);
    expectFileExists(".hex").toBeFalsy();
});

Deno.test("You can only specify a single device",() => {
    const demo = docTest();
    demo.source([
        '    {{ device("ATTiny24"); }}',
        '    {{ device("ATTiny24"); }}',
        '    {{ device("ATTiny2313"); }}',
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny24"); }}',
        '                      2     {{ device("ATTiny24"); }}',
        "                        symbol_alreadyExists",
        "                        name: deviceName",
        "                        definition: /var/tmp/demo.asm:1",
        '                      3     {{ device("ATTiny2313"); }}',
        "                        symbol_alreadyExists",
        "                        name: deviceName",
        "                        definition: /var/tmp/demo.asm:1",
    ]);
    expectFileExists(".hex").toBeFalsy();
});
