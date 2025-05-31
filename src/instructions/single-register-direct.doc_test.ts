import { docTest, expectFileContents, expectFileExists } from "../assembler/doc-test.ts";

Deno.test("Single Register Direct Demo", () => {
    const demo = docTest();
    demo.source("", [
        '    {{ device("ATTiny24"); }}',
        "    POP R6",
        "    PUSH R7",
        "    COM R14",
        "    DEC R22",
        "    INC R20",
        "    LSR R6",
        "    ASR R10",
        "    NEG R11",
        "    SWAP R7",
        "    ROR R19",
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny24"); }}',
        "000000 6F 90          2     POP R6",
        "000001 7F 92          3     PUSH R7",
        "000002 E0 94          4     COM R14",
        "000003 6A 95          5     DEC R22",
        "000004 43 95          6     INC R20",
        "000005 66 94          7     LSR R6",
        "000006 A5 94          8     ASR R10",
        "000007 B1 94          9     NEG R11",
        "000008 72 94         10     SWAP R7",
        "000009 37 95         11     ROR R19",
        "",
        "Symbol Table",
        "============",
        "",
        "R6  |   |   | REGISTER | 2",
        "R7  |   |   | REGISTER | 2",
        "R10 |   |   | REGISTER | 1",
        "R11 |   |   | REGISTER | 1",
        "R14 |   |   | REGISTER | 1",
        "R19 |   |   | REGISTER | 1",
        "R20 |   |   | REGISTER | 1",
        "R22 |   |   | REGISTER | 1",
    ]);
    expectFileContents(".hex").toEqual([
        ":020000020000FC",
        ":100000006F907F92E0946A9543956694A594B1941D",
        ":04001000729437951A",
        ":00000001FF"
    ]);
});

Deno.test("Read-Modify-Write Demo", () => {
    const demo = docTest();
    demo.mockUnsupportedDevice({
        "unsupportedInstructions": [],
        "programMemoryBytes": 0x0100,
        "reducedCore": false
    });
    demo.source("", [
        '    {{ device("DemoDevice"); }}',
        "    LAC Z, R20",
        "    LAS Z, R21",
        "    LAT Z, R22",
        "    XCH Z, R15"
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("DemoDevice"); }}',
        "000000 46 93          2     LAC Z, R20",
        "000001 55 93          3     LAS Z, R21",
        "000002 67 93          4     LAT Z, R22",
        "000003 F4 92          5     XCH Z, R15",
        "",
        "Symbol Table",
        "============",
        "",
        "R15 |   |   | REGISTER | 1",
        "R20 |   |   | REGISTER | 1",
        "R21 |   |   | REGISTER | 1",
        "R22 |   |   | REGISTER | 1"
    ]);
    expectFileContents(".hex").toEqual([
        ":020000020000FC",
        ":08000000469355936793F492B7",
        ":00000001FF",
    ]);
});

Deno.test("Read-Modify-Write isn't available on all devices", () => {
    const demo = docTest();
    demo.source("", [
        '    {{ device("ATTiny24"); }}',
        "    LAC Z, R20",
        "    LAS Z, R21",
        "    LAT Z, R22",
        "    XCH Z, R15"
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny24"); }}',
        "                      2     LAC Z, R20",
        "                        notSupported_mnemonic",
        "                        used: LAC",
        "                      3     LAS Z, R21",
        "                        notSupported_mnemonic",
        "                        used: LAS",
        "                      4     LAT Z, R22",
        "                        notSupported_mnemonic",
        "                        used: LAT",
        "                      5     XCH Z, R15",
        "                        notSupported_mnemonic",
        "                        used: XCH",
        "",
        "Symbol Table",
        "============",
        "",
        "R15 |   |   | REGISTER | 1",
        "R20 |   |   | REGISTER | 1",
        "R21 |   |   | REGISTER | 1",
        "R22 |   |   | REGISTER | 1"
    ]);
    expectFileExists(".hex").toBe(false);
});

Deno.test("Read-Modify-Write expects the index register to be Z", () => {
    const demo = docTest();
    demo.mockUnsupportedDevice({
        "unsupportedInstructions": [],
        "programMemoryBytes": 0x0100,
        "reducedCore": false
    });
    demo.source("", [
        '    {{ device("DemoDevice"); }}',
        "    LAC R30, R20",
        "    LAS X, R21",
        "    LAT Y, R22",
        "    XCH z, R15"
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("DemoDevice"); }}',
        "000000 46 93          2     LAC R30, R20",
        "                        operand_symbolic",
        "                        location.operand: 0",
        "                        expected: Z",
        "                        actual: R30",

        "                        type_failure",
        "                        location.operand: 0",
        "                        expected: index",
        "                        actual: register",

        "000001 55 93          3     LAS X, R21",
        "                        operand_symbolic",
        "                        location.operand: 0",
        "                        expected: Z",
        "                        actual: X",

        "000002 67 93          4     LAT Y, R22",
        "                        operand_symbolic",
        "                        location.operand: 0",
        "                        expected: Z",
        "                        actual: Y",

        "000003 F4 92          5     XCH z, R15",
        "",
        "Symbol Table",
        "============",
        "",
        "R15 |   |   | REGISTER | 1",
        "R20 |   |   | REGISTER | 1",
        "R21 |   |   | REGISTER | 1",
        "R22 |   |   | REGISTER | 1",
        "R30 |   |   | REGISTER | 1"
    ]);
    expectFileExists(".hex").toBe(false);
});
