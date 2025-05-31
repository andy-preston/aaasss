import { docTest, expectFileContents } from "../demos-as-tests/doc-test.ts";

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
        "000000 98 94          2     BCLR 1",
        "000001 88 94          3     CLC",
        "000002 98 94          4     CLZ",
        "000003 A8 94          5     CLN",
        "000004 B8 94          6     CLV",
        "000005 C8 94          7     CLS",
        "000006 D8 94          8     CLH",
        "000007 E8 94          9     CLT",
        "000008 F8 94         10     CLI",
        "000009 18 94         11     BSET 1",
        "00000A 08 94         12     SEC",
        "00000B 18 94         13     SEZ",
        "00000C 28 94         14     SEN",
        "00000D 38 94         15     SEV",
        "00000E 48 94         16     SES",
        "00000F 58 94         17     SEH",
        "000010 68 94         18     SET",
        "000011 78 94         19     SEI",
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
