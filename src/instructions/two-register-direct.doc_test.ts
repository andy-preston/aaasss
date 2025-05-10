import { docTest, expectFileContents, expectFileExists } from "../assembler/doc-test.ts";

Deno.test("Two register direct demo",() => {
    const demo = docTest();
    demo.mockUnsupportedDevice({
        "unsupportedInstructions": [],
        "programMemoryBytes": 0x0100,
        "reducedCore": false
    });
    demo.source("", [
        '    {{ device("ATMega 328"); }}',
        "    ADC R1, R2",
        "    ADD R3, R4",
        "    AND R7, R8",
        "    CLR R14",
        "    CP R15, R16",
        "    CPC R17, R18",
        "    CPSE R20, R21",
        "    EOR R23, R0",
        "    LSL R5",
        "    MOV R7, R8",
        "    MUL R8, R16",
        "    OR R12, R13",
        "    ROL R20",
        "    SBC R20, R2",
        "    SUB R1, R2",
        "    TST R8",
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATMega 328"); }}',
        "000000 1C 12          2     ADC R1, R2",
        "000001 0C 34          3     ADD R3, R4",
        "000002 20 78          4     AND R7, R8",
        "000003 24 EE          5     CLR R14",
        "000004 16 F0          6     CP R15, R16",
        "000005 07 12          7     CPC R17, R18",
        "000006 13 45          8     CPSE R20, R21",
        "000007 25 70          9     EOR R23, R0",
        "000008 0C 55         10     LSL R5",
        "000009 2C 78         11     MOV R7, R8",
        "00000A 9E 80         12     MUL R8, R16",
        "00000B 28 CD         13     OR R12, R13",
        "00000C 1F 44         14     ROL R20",
        "00000D 09 42         15     SBC R20, R2",
        "00000E 18 12         16     SUB R1, R2",
        "00000F 20 88         17     TST R8",
        "",
        "Symbol Table",
        "============",
        "",
        "R0  |   |   | REGISTER | 1",
        "R1  |   |   | REGISTER | 2",
        "R2  |   |   | REGISTER | 3",
        "R3  |   |   | REGISTER | 1",
        "R4  |   |   | REGISTER | 1",
        "R5  |   |   | REGISTER | 1",
        "R7  |   |   | REGISTER | 2",
        "R8  |   |   | REGISTER | 4",
        "R12 |   |   | REGISTER | 1",
        "R13 |   |   | REGISTER | 1",
        "R14 |   |   | REGISTER | 1",
        "R15 |   |   | REGISTER | 1",
        "R16 |   |   | REGISTER | 2",
        "R17 |   |   | REGISTER | 1",
        "R18 |   |   | REGISTER | 1",
        "R20 |   |   | REGISTER | 3",
        "R21 |   |   | REGISTER | 1",
        "R23 |   |   | REGISTER | 1",
    ]);
    // This comes from the last version of GAVRAsm that I could get hold of.
    expectFileContents(".hex").toEqual([
        ":020000020000FC",
        ":10000000121C340C7820EE24F016120745137025CC",
        ":10001000550C782C809ECD28441F42091218882048",
        ":00000001FF"
    ]);
});

Deno.test("Many chips do not support 8-bit multiply",() => {
    const demo = docTest();
    demo.source("", [
        '    {{ device("ATTiny 24"); }}',
        "    MUL R0, R1"
        ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny 24"); }}',
        "                      2     MUL R0, R1",
        "                        notSupported_mnemonic",
        "                        used: MUL",
        "",
        "Symbol Table",
        "============",
        "",
        "R0 |   |   | REGISTER | 1",
        "R1 |   |   | REGISTER | 1"
    ]);
    expectFileExists(".hex").toBeFalsy();
});

