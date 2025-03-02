import { assertFileContains, docTest } from "../assembler/doc-test.ts";

Deno.test("Data-direct without reduced core",() => {
    const demo = docTest();
    demo.source([
        '    {{ device("ATTiny24"); }}',
        "    LDS R30, 512 * 2", // LDS register, data-memory address
        "    STS 1024 * 4, R8", // STS data-memory address, register
    ]);
    demo.assemble();
    assertFileContains(".lst", [
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny24"); }}',
        "000000 91 E0 04 00    2     LDS R30, 512 * 2",
        "000002 92 80 10 00    3     STS 1024 * 4, R8",
        "",
        "Symbol Table",
        "============",
        "",
        "R8 (1)",
        "R30 (1)"
    ]);
    // This comes from the last version of GAVRAsm that I could get hold of.
    assertFileContains(".hex", [
        ":020000020000FC",
        ":08000000E09100048092001061",
        ":00000001FF"
    ]);
});

Deno.test("Data-direct with reduced core",() => {
    const demo = docTest();
    demo.mockUnsupportedDevice({
        "unsupportedInstructions": { "value": [] },
        "programMemoryBytes":      { "value": "0100" },
        "reducedCore":             { "value": true }
    });
    demo.source([
        '    {{ device("ATtiny20"); }}',
        "    LDS R30, 12 * 10",
        "    STS 126, R18"
    ]);
    demo.assemble();
    assertFileContains(".lst", [
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATtiny20"); }}',
        "000000 A7 E8          2     LDS R30, 12 * 10",
        "000001 AF 2E          3     STS 126, R18",
        "",
        "Symbol Table",
        "============",
        "",
        "R18 (1)",
        "R30 (1)"
    ]);
    // This comes from the last version of GAVRAsm that I could get hold of.
    assertFileContains(".hex", [
        ":020000020000FC",
        ":04000000E8A72EAF90",
        ":00000001FF"
    ]);
});
