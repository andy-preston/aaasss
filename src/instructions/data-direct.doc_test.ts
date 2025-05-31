import { docTest, expectFileContents } from "../demos-as-tests/doc-test.ts";

Deno.test("Data-direct without reduced core",() => {
    const demo = docTest();
    demo.source("", [
        '    {{ device("ATTiny24"); }}',
        "    LDS R30, 512 * 2", // LDS register, data-memory address
        "    STS 1024 * 4, R8", // STS data-memory address, register
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny24"); }}',
        "000000 E0 91 00 04    2     LDS R30, 512 * 2",
        "000002 80 92 00 10    3     STS 1024 * 4, R8",
        "",
        "Symbol Table",
        "============",
        "",
        "R8  |   |   | REGISTER | 1",
        "R30 |   |   | REGISTER | 1"
    ]);
    // This comes from the last version of GAVRAsm that I could get hold of.
    expectFileContents(".hex").toEqual([
        ":020000020000FC",
        ":08000000E09100048092001061",
        ":00000001FF"
    ]);
});

Deno.test("Data-direct with reduced core",() => {
    const demo = docTest();
    demo.mockUnsupportedDevice({
        "unsupportedInstructions": [],
        "programMemoryBytes": 0x0100,
        "reducedCore": true
    });
    demo.source("", [
        '    {{ device("ATtiny20"); }}',
        "    LDS R30, 12 * 10",
        "    STS 126, R18"
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATtiny20"); }}',
        "000000 E8 A7          2     LDS R30, 12 * 10",
        "000001 2E AF          3     STS 126, R18",
        "",
        "Symbol Table",
        "============",
        "",
        "R18 |   |   | REGISTER | 1",
        "R30 |   |   | REGISTER | 1"
    ]);
    // This comes from the last version of GAVRAsm that I could get hold of.
    expectFileContents(".hex").toEqual([
        ":020000020000FC",
        ":04000000E8A72EAF90",
        ":00000001FF"
    ]);
});
