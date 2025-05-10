import { docTest, expectFileContents, expectFileExists } from "../assembler/doc-test.ts";

Deno.test("IO Byte Demo", () => {
    const demo = docTest();
    demo.source("", [
        '    {{ device("ATTiny24"); }}',
        //       Note that we're adding 0x20 to literal IO Address here
        "    IN R19, 25 + 0x20",
        //       Because operands are given as data memory addresses
        //       (to be compatible with LDS and SDS)
        "    OUT 53 + 0x20, R16",
        //       If you only use the pre-defined IO port labels, you don't need
        //       to care!
        "    IN R19, PINA",
        "    OUT MCUCR, R16",
        "",
        "    CBI PORTA, 5",
        "    SBI PORTB, 0",
        "    SBIC PINA, 6",
        "    SBIC PINB, 3"
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny24"); }}',
        "000000 B3 39          2     IN R19, 25 + 0x20",
        "000001 BF 05          3     OUT 53 + 0x20, R16",
        "000002 B3 39          4     IN R19, PINA",
        "000003 BF 05          5     OUT MCUCR, R16",
        "                      6",
        "000004 98 DD          7     CBI PORTA, 5",
        "000005 9A C0          8     SBI PORTB, 0",
        "000006 99 CE          9     SBIC PINA, 6",
        "000007 99 B3         10     SBIC PINB, 3",
        "",
        "Symbol Table",
        "============",
        "",
        "MCUCR | 85 | 55 | /var/tmp/demo.asm:1 | 1",
        "PINA  | 57 | 39 | /var/tmp/demo.asm:1 | 2",
        "PINB  | 54 | 36 | /var/tmp/demo.asm:1 | 1",
        "PORTA | 59 | 3B | /var/tmp/demo.asm:1 | 1",
        "PORTB | 56 | 38 | /var/tmp/demo.asm:1 | 1",
        "R16   |    |    | REGISTER            | 2",
        "R19   |    |    | REGISTER            | 2",
    ]);
    // This comes from the last version of GAVRAsm that I could get hold of.
    expectFileContents(".hex").toEqual([
        ":020000020000FC",
        ":1000000039B305BF39B305BFDD98C09ACE99B3990E",
        ":00000001FF"
    ]);
});

Deno.test("Ports > 5F are out of range", () => {
    const demo = docTest();
    demo.source("", [
        '    {{ device("ATTiny24"); }}',
        "    IN R19, 0x60",
        "    CBI 0x60, 5"
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny24"); }}',
        "000000 B1 30          2     IN R19, 0x60",
        "                        type_ioPort",
        "                        location.operand: 1",
        "                        value: 96",
        "                        min: 32",
        "                        max: 95",

        "                        notSupported_ioRange",
        "                        used: IN",
        "                        suggestion: LDS",


        "000001 98 05          3     CBI 0x60, 5",
        "                        type_ioPort",
        "                        location.operand: 0",
        "                        value: 96",
        "                        min: 32",
        "                        max: 95",

        "                        notSupported_ioRange",
        "                        used: CBI",
        "                        suggestion: CBR & STS",
        "",
        "Symbol Table",
        "============",
        "",
        "R19 |   |   | REGISTER | 1"
    ]);
    expectFileExists(".hex").toBeFalsy();
});
