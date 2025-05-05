import { docTest, expectFileContents } from "../assembler/doc-test.ts";

Deno.test("Relative Program Demo", () => {
    const demo = docTest();
    demo.mockUnsupportedDevice({
        "unsupportedInstructions": { "value": [] },
        "programMemoryBytes":      { "value": "0100" },
        "reducedCore":             { "value": false }
    });
    demo.source("", [
        '    {{ device("Fake Device"); }}',
        "back:",
        "    NOP",
        "    NOP",
        "    NOP",
        "    RCALL back",
        "    RJMP back",
        "    RCALL forward",
        "    RJMP forward",
        "    NOP",
        "    NOP",
        "    NOP",
        "forward:",
        "    NOP",
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("Fake Device"); }}',
        "                      2 back:",
        "000000 00 00          3     NOP",
        "000001 00 00          4     NOP",
        "000002 00 00          5     NOP",

        "000003 DF FC          6     RCALL back",
        "000004 CF FB          7     RJMP back",
        "000005 D0 04          8     RCALL forward",
        "000006 C0 03          9     RJMP forward",
        "000007 00 00         10     NOP",
        "000008 00 00         11     NOP",
        "000009 00 00         12     NOP",
        "                     13 forward:",
        "00000A 00 00         14     NOP",
        "",
        "Symbol Table",
        "============",
        "",
        "back    | 0  | 0 | /var/tmp/demo.asm:2  | 2",
        "forward | 10 | A | /var/tmp/demo.asm:13 | 0"
    ]);
    expectFileContents(".hex").toEqual([
        ":020000020000FC",
        ":10000000000000000000FCDFFBCF04D003C00000B4",
        ":06001000000000000000EA",
        ":00000001FF",
    ]);
});
