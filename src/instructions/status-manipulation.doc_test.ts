import { docTest, expectFileContents } from "../assembler/doc-test.ts";

Deno.test("Status manipulation demo",() => {
    const demo = docTest();
    demo.source("", [
        '    {{ device("AT Tiny 24"); }}',
        "    BCLR 1",
        "    CLC",
        "    CLZ",
        "    CLN",
        "    CLV",
        "    CLS",
        "    CLH",
        "    CLT",
        "    CLI",
        "    BSET 1",
        "    SEC",
        "    SEZ",
        "    SEN",
        "    SEV",
        "    SES",
        "    SEH",
        "    SET",
        "    SEI"
        ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("AT Tiny 24"); }}',
        "000000 94 98          2     BCLR 1",
        "000001 94 88          3     CLC",
        "000002 94 98          4     CLZ",
        "000003 94 A8          5     CLN",
        "000004 94 B8          6     CLV",
        "000005 94 C8          7     CLS",
        "000006 94 D8          8     CLH",
        "000007 94 E8          9     CLT",
        "000008 94 F8         10     CLI",
        "000009 94 18         11     BSET 1",
        "00000A 94 08         12     SEC",
        "00000B 94 18         13     SEZ",
        "00000C 94 28         14     SEN",
        "00000D 94 38         15     SEV",
        "00000E 94 48         16     SES",
        "00000F 94 58         17     SEH",
        "000010 94 68         18     SET",
        "000011 94 78         19     SEI",
    ]);
    // This comes from the last version of GAVRAsm that I could get hold of.
    expectFileContents(".hex").toEqual([
        ":020000020000FC",
        ":10000000989488949894A894B894C894D894E894B0",
        ":10001000F894189408941894289438944894589410",
        ":0400200068947894D4",
        ":00000001FF",
    ]);
});
