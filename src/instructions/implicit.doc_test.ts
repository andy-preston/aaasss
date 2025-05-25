import { docTest, expectFileContents } from "../assembler/doc-test.ts";

Deno.test("Immediate Mode Demo", () => {
    const demo = docTest();
    demo.source("", [
        '    {{ device("AT Mega 328"); }}',
        "    BREAK",
        "    NOP",
        "    RET",
        "    RETI",
        "    SLEEP",
        "    WDR",
        "    IJMP",
        "    ICALL",
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("AT Mega 328"); }}',
        "000000 95 98          2     BREAK",
        "000001 00 00          3     NOP",
        "000002 95 08          4     RET",
        "000003 95 18          5     RETI",
        "000004 95 88          6     SLEEP",
        "000005 95 A8          7     WDR",
        "000006 94 09          8     IJMP",
        "000007 95 09          9     ICALL"
    ]);
    expectFileContents(".hex").toEqual([
        ":020000020000FC",
        ":1000000098950000089518958895A89509940995E4",
        ":00000001FF"
    ]);
});

Deno.test("Have we got a lot of program memory?", () => {
    const demo = docTest();
    demo.mockUnsupportedDevice({
        "unsupportedInstructions": [],
        "programMemoryBytes": 0x0100
    });
    demo.source("", [
        '    {{ device("imaginary"); }}',
        "    EIJMP",
        "    EICALL"
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("imaginary"); }}',
        "000000 94 19          2     EIJMP",
        "000001 95 19          3     EICALL"
        ]);
    expectFileContents(".hex").toEqual([
        ":020000020000FC",
        ":0400000019941995A1",
        ":00000001FF"
    ]);
});
