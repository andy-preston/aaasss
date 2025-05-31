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
        "000000 98 95          2     BREAK",
        "000001 00 00          3     NOP",
        "000002 08 95          4     RET",
        "000003 18 95          5     RETI",
        "000004 88 95          6     SLEEP",
        "000005 A8 95          7     WDR",
        "000006 09 94          8     IJMP",
        "000007 09 95          9     ICALL"
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
        "000000 19 94          2     EIJMP",
        "000001 19 95          3     EICALL"
        ]);
    expectFileContents(".hex").toEqual([
        ":020000020000FC",
        ":0400000019941995A1",
        ":00000001FF"
    ]);
});
