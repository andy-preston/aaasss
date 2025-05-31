import { docTest, expectFileContents } from "../demos-as-tests/doc-test.ts";

Deno.test("Byte Immediate Demo",() => {
    const demo = docTest();
    demo.source("", [
        '    {{ device("ATTiny24"); }}',
        "    CPI R16, 0",
        "    CPI R31, 0",
        "    CPI R16, 255",
        "    CPI R19, 53",
        "    SBCI R18, 19",
        "    SUBI R17, 47",
        "    ORI R17, 86",
        "    SBR R19, 64",
        "    ANDI R20, 6",
        "    CBR R23, 128",
        "    LDI R17, 77",
        "    LDI R17, complement(-128)",
        "    LDI R19, 255",
        "    SER R19"
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny24"); }}',
        "000000 00 30          2     CPI R16, 0",
        "000001 F0 30          3     CPI R31, 0",
        "000002 0F 3F          4     CPI R16, 255",
        "000003 35 33          5     CPI R19, 53",
        "000004 23 41          6     SBCI R18, 19",
        "000005 1F 52          7     SUBI R17, 47",
        "000006 16 65          8     ORI R17, 86",
        "000007 30 64          9     SBR R19, 64",
        "000008 46 70         10     ANDI R20, 6",
        "000009 7F 77         11     CBR R23, 128",
        "00000A 1D E4         12     LDI R17, 77",
        "00000B 10 E8         13     LDI R17, complement(-128)",
        "00000C 3F EF         14     LDI R19, 255",
        "00000D 3F EF         15     SER R19",
        "",
        "Symbol Table",
        "============",
        "",
        "R16 |   |   | REGISTER | 2",
        "R17 |   |   | REGISTER | 4",
        "R18 |   |   | REGISTER | 1",
        "R19 |   |   | REGISTER | 4",
        "R20 |   |   | REGISTER | 1",
        "R23 |   |   | REGISTER | 1",
        "R31 |   |   | REGISTER | 1"
    ]);
    expectFileContents(".hex").toEqual([
        ":020000020000FC",
        ":100000000030F0300F3F353323411F521665306406",
        ":0C00100046707F771DE410E83FEF3FEFE3",
        ":00000001FF",
    ]);
});
