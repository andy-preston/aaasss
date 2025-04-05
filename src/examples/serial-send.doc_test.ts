import { docTest, expectFileContents } from "../assembler/doc-test.ts";

Deno.test("serial-send Demo", () => {
    const demo = docTest();
    demo.source([
        '    {{ device("ATTiny2313"); }}',
        "",
        "    {{",
        "        const clockFrequency = 14745600;",
        "        const baudRate = 9600;",
        "        const multiplier = baudRate * 16;",
        '        define("baudSelector", (clockFrequency / multiplier) - 1);',
        "    }}",
        "",
        "    cli",
        "    clr R0",
        "    clr R1",
        "    dec R1",
        "",
        "setup_timer:",
        "    out TCCR1A, R0",
        "",
        "    ldi R18, (1 << CS12)",
        "    out TCCR1B, R18",
        "",
        "    ldi R18, high(1152)",
        "    out OCR1AH, R18",
        "    ldi R18, low(1152)",
        "    out OCR1AL, R18",
        "",
        "start_interval_timers:",
        "    out TCNT1H, R0",
        "    out TCNT1L, R0",
        "",
        "    ldi R18, (1 << OCF1A) | (1 << OCF1B)",
        "    out TIFR, R18",
        "",
        "setup_serial:",
        "    ldi R18, high(baudSelector)",
        "    out UBRRH, R18",
        "    ldi R18, low(baudSelector)",
        "    out UBRRL, R18",
        "",
        "    out UCSRA, R0",
        "",
        "    ldi R18, (1 << TXEN)",
        "    out UCSRB, R18",
        "",
        "    ldi R18, (1 << UCSZ0) | (1 << UCSZ1)",
        "    out UCSRC, R18",
        "",
        "the_top:",
        "    ldi ZL, low(digits_to_send << 1)",
        "    ldi ZH, high(digits_to_send << 1)",
        "",
        "send_digit:",
        "    out TCNT1H, R0",
        "    out TCNT1L, R0",
        "",
        "    ldi R18, (1 << OCF1A) | (1 << OCF1B)",
        "    out TIFR, R18",
        "",
        "wait_for_20ms_interval:",
        "    in R2, TIFR",
        "    sbrs R2, OCF1A",
        "    rjmp wait_for_20ms_interval",
        "",
        "get_next_char:",
        "    lpm R20, Z+",
        '    cpi R20, " ".charCodeAt(0)',
        "    breq the_top",
        "",
        "write_serial:",
        "    tst R20",
        "    breq send_digit",
        "",
        "buffer_wait:",
        "    sbis UCSRA, UDRE",
        "    rjmp buffer_wait",
        "",
        "    out    UDR, R20",
        "",
        "    rjmp send_digit",
        "",
        "digits_to_send:",
        '    {{ poke ("Testing1234 "); }}',
        ""
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny2313"); }}',
        "                      2",
        "                      3     {{",
        "                      4         const clockFrequency = 14745600;",
        "                      5         const baudRate = 9600;",
        "                      6         const multiplier = baudRate * 16;",
        '                      7         define("baudSelector", (clockFrequency / multiplier) - 1);',
        "                      8     }}",
        "                      9",
        "000000 94 F8         10     cli",
        "000001 24 00         11     clr R0",
        "000002 24 11         12     clr R1",

        "000003 94 1A         13     dec R1",
        "                     14",
        "                     15 setup_timer:",
        "000004 BC 0F         16     out TCCR1A, R0",
        "                     17",
        "000005 E0 24         18     ldi R18, (1 << CS12)",
        "000006 BD 2E         19     out TCCR1B, R18",
        "                     20",
        "000007 E0 24         21     ldi R18, high(1152)",
        "000008 BD 2B         22     out OCR1AH, R18",
        "000009 E8 20         23     ldi R18, low(1152)",
        "00000A BD 2A         24     out OCR1AL, R18",
        "                     25",
        "                     26 start_interval_timers:",
        "00000B BC 0D         27     out TCNT1H, R0",
        "00000C BC 0C         28     out TCNT1L, R0",
        "                     29",
        "00000D E6 20         30     ldi R18, (1 << OCF1A) | (1 << OCF1B)",
        "00000E BF 28         31     out TIFR, R18",
        "                     32",
        "                     33 setup_serial:",
        "00000F E0 20         34     ldi R18, high(baudSelector)",
        "000010 B9 22         35     out UBRRH, R18",
        "000011 E5 2F         36     ldi R18, low(baudSelector)",
        "000012 B9 29         37     out UBRRL, R18",
        "                     38",
        "000013 B8 0B         39     out UCSRA, R0",
        "                     40",
        "000014 E0 28         41     ldi R18, (1 << TXEN)",
        "000015 B9 2A         42     out UCSRB, R18",
        "                     43",
        "000016 E0 26         44     ldi R18, (1 << UCSZ0) | (1 << UCSZ1)",
        "000017 B9 23         45     out UCSRC, R18",
        "                     46",
        "                     47 the_top:",
        "000018 E4 E6         48     ldi ZL, low(digits_to_send << 1)",
        "000019 E0 F0         49     ldi ZH, high(digits_to_send << 1)",
        "                     50",
        "                     51 send_digit:",
        "00001A BC 0D         52     out TCNT1H, R0",
        "00001B BC 0C         53     out TCNT1L, R0",
        "                     54",
        "00001C E6 20         55     ldi R18, (1 << OCF1A) | (1 << OCF1B)",
        "00001D BF 28         56     out TIFR, R18",
        "                     57",
        "                     58 wait_for_20ms_interval:",
        "00001E B6 28         59     in R2, TIFR",
        "00001F FE 26         60     sbrs R2, OCF1A",
        "                     61     rjmp wait_for_20ms_interval",
        "                        mnemonic_unknown",
        "                        clue: RJMP",
        "                     62",
        "                     63 get_next_char:",
        "                     64     lpm R20, Z+",
        "                        operand_offsetNotLdd",
        "                        location.operand: 1",
        "                        mnemonic_unknown",
        "                        clue: LPM",
        '000020 32 40         65     cpi R20, " ".charCodeAt(0)',
        "                     66     breq the_top",
        "                        mnemonic_unknown",
        "                        clue: BREQ",
        "                     67",
        "                     68 write_serial:",
        "000021 23 44         69     tst R20",
        "                     70     breq send_digit",
        "                        mnemonic_unknown",
        "                        clue: BREQ",
        "                     71",
        "                     72 buffer_wait:",
        "                     73     sbis UCSRA, UDRE",
        "                        mnemonic_unknown",
        "                        clue: SBIS",
        "                     74     rjmp buffer_wait",
        "                        mnemonic_unknown",
        "                        clue: RJMP",
        "                     75",
        "000022 B9 4C         76     out    UDR, R20",
        "                     77",
        "                     78     rjmp send_digit",
        "                        mnemonic_unknown",
        "                        clue: RJMP",
        "                     79",
        "                     80 digits_to_send:",
        '000023 54 65 73 74   81     {{ poke ("Testing1234 "); }}',
        "000025 69 6E 67 31",
        "000027 32 33 34 20",
        "                     82",
        "",
        "Symbol Table",
        "============",
        "",
        "baudSelector           | 95 | 5F | /var/tmp/demo.asm:8  | 2",
        "buffer_wait            | 34 | 22 | /var/tmp/demo.asm:72 | 1",
        "CS12                   | 2  | 2  | /var/tmp/demo.asm:1  | 1",
        "digits_to_send         | 35 | 23 | /var/tmp/demo.asm:80 | 0",
        "get_next_char          | 32 | 20 | /var/tmp/demo.asm:63 | 0",
        "OCF1A                  | 6  | 6  | /var/tmp/demo.asm:1  | 3",
        "OCF1B                  | 5  | 5  | /var/tmp/demo.asm:1  | 2",
        "OCR1AH                 | 75 | 4B | /var/tmp/demo.asm:1  | 1",
        "OCR1AL                 | 74 | 4A | /var/tmp/demo.asm:1  | 1",
        "R0                     |    |    | REGISTER             | 7",
        "R1                     |    |    | REGISTER             | 2",
        "R2                     |    |    | REGISTER             | 2",
        "R18                    |    |    | REGISTER             | 18",
        "R20                    |    |    | REGISTER             | 4",
        "send_digit             | 26 | 1A | /var/tmp/demo.asm:51 | 2",
        "setup_serial           | 15 | F  | /var/tmp/demo.asm:33 | 0",
        "setup_timer            | 4  | 4  | /var/tmp/demo.asm:15 | 0",
        "start_interval_timers  | 11 | B  | /var/tmp/demo.asm:26 | 0",
        "TCCR1A                 | 79 | 4F | /var/tmp/demo.asm:1  | 1",
        "TCCR1B                 | 78 | 4E | /var/tmp/demo.asm:1  | 1",
        "TCNT1H                 | 77 | 4D | /var/tmp/demo.asm:1  | 2",
        "TCNT1L                 | 76 | 4C | /var/tmp/demo.asm:1  | 2",
        "the_top                | 24 | 18 | /var/tmp/demo.asm:47 | 1",
        "TIFR                   | 88 | 58 | /var/tmp/demo.asm:1  | 3",
        "TXEN                   | 3  | 3  | /var/tmp/demo.asm:1  | 1",
        "UBRRH                  | 34 | 22 | /var/tmp/demo.asm:1  | 1",
        "UBRRL                  | 41 | 29 | /var/tmp/demo.asm:1  | 1",
        "UCSRA                  | 43 | 2B | /var/tmp/demo.asm:1  | 2",
        "UCSRB                  | 42 | 2A | /var/tmp/demo.asm:1  | 1",
        "UCSRC                  | 35 | 23 | /var/tmp/demo.asm:1  | 1",
        "UCSZ0                  | 1  | 1  | /var/tmp/demo.asm:1  | 1",
        "UCSZ1                  | 2  | 2  | /var/tmp/demo.asm:1  | 1",
        "UDR                    | 44 | 2C | /var/tmp/demo.asm:1  | 1",
        "UDRE                   | 5  | 5  | /var/tmp/demo.asm:1  | 1",
        "wait_for_20ms_interval | 30 | 1E | /var/tmp/demo.asm:58 | 1",
        "write_serial           | 33 | 21 | /var/tmp/demo.asm:68 | 0",
        "ZH                     |    |    | REGISTER             | 1",
        "ZL                     |    |    | REGISTER             | 1"
    ]);
});
