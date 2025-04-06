import { docTest, expectFileContents } from "../assembler/doc-test.ts";

Deno.test("serial-send Demo", () => {
    const demo = docTest();
    demo.source([
        '    {{ device("ATTiny2313"); }}',
        "",
        "    {{",
        "        const clockFrequency = 14745600;",
        "        const timerPreScale = 256;",
        "",
        "        const baudRate = 9600;",
        "        const multiplier = baudRate * 16;",
        '        define("baudSelector", (clockFrequency / multiplier) - 1);',
        "",
        "        const shiftMap = new Map([",
        "            [0,    0],",
        "            [1,    1 << CS10],",
        "            [8,    1 << CS11],",
        "            [64,   (1 << CS11) | (1 << CS10)],",
        "            [256,  (1 << CS12)],",
        "            [1024, (1 << CS12) | (1 << CS10)]",
        "        ]);",
        '        define("clockSelect", shiftMap.get(timerPreScale));',
        "",
        "        const halfPeriodMilliseconds = 20;",
        "        const timerFrequency = clockFrequency / timerPreScale;",
        "        const tick = (1 / timerFrequency) * 1000;",
        "        const ticks = halfPeriodMilliseconds / tick;",
        '        define("ticks", Math.round(ticks));',
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
        "    ldi R18, clockSelect",
        "    out TCCR1B, R18",
        "",
        "    ldi R18, high(ticks)",
        "    out OCR1AH, R18",
        "    ldi R18, low(ticks)",
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
        "                      5         const timerPreScale = 256;",
        "                      6",
        "                      7         const baudRate = 9600;",
        "                      8         const multiplier = baudRate * 16;",
        '                      9         define("baudSelector", (clockFrequency / multiplier) - 1);',
        "                     10",
        "                     11         const shiftMap = new Map([",
        "                     12             [0,    0],",
        "                     13             [1,    1 << CS10],",
        "                     14             [8,    1 << CS11],",
        "                     15             [64,   (1 << CS11) | (1 << CS10)],",
        "                     16             [256,  (1 << CS12)],",
        "                     17             [1024, (1 << CS12) | (1 << CS10)]",
        "                     18         ]);",
        '                     19         define("clockSelect", shiftMap.get(timerPreScale));',
        "                     20",
        "                     21         const halfPeriodMilliseconds = 20;",
        "                     22         const timerFrequency = clockFrequency / timerPreScale;",
        "                     23         const tick = (1 / timerFrequency) * 1000;",
        "                     24         const ticks = halfPeriodMilliseconds / tick;",
        '                     25         define("ticks", Math.round(ticks));',
        "                     26     }}",
        "                     27",
        "000000 94 F8         28     cli",
        "000001 24 00         29     clr R0",
        "000002 24 11         30     clr R1",
        "000003 94 1A         31     dec R1",
        "                     32",
        "                     33 setup_timer:",
        "000004 BC 0F         34     out TCCR1A, R0",
        "                     35",
        "000005 E0 24         36     ldi R18, clockSelect",
        "000006 BD 2E         37     out TCCR1B, R18",
        "                     38",
        "000007 E0 24         39     ldi R18, high(ticks)",
        "000008 BD 2B         40     out OCR1AH, R18",
        "000009 E8 20         41     ldi R18, low(ticks)",
        "00000A BD 2A         42     out OCR1AL, R18",
        "                     43",
        "                     44 start_interval_timers:",
        "00000B BC 0D         45     out TCNT1H, R0",
        "00000C BC 0C         46     out TCNT1L, R0",
        "                     47",
        "00000D E6 20         48     ldi R18, (1 << OCF1A) | (1 << OCF1B)",
        "00000E BF 28         49     out TIFR, R18",
        "                     50",
        "                     51 setup_serial:",
        "00000F E0 20         52     ldi R18, high(baudSelector)",
        "000010 B9 22         53     out UBRRH, R18",
        "000011 E5 2F         54     ldi R18, low(baudSelector)",
        "000012 B9 29         55     out UBRRL, R18",
        "                     56",
        "000013 B8 0B         57     out UCSRA, R0",
        "                     58",
        "000014 E0 28         59     ldi R18, (1 << TXEN)",
        "000015 B9 2A         60     out UCSRB, R18",
        "                     61",
        "000016 E0 26         62     ldi R18, (1 << UCSZ0) | (1 << UCSZ1)",
        "000017 B9 23         63     out UCSRC, R18",
        "                     64",
        "                     65 the_top:",
        "000018 E4 E6         66     ldi ZL, low(digits_to_send << 1)",
        "000019 E0 F0         67     ldi ZH, high(digits_to_send << 1)",
        "                     68",
        "                     69 send_digit:",
        "00001A BC 0D         70     out TCNT1H, R0",
        "00001B BC 0C         71     out TCNT1L, R0",
        "                     72",
        "00001C E6 20         73     ldi R18, (1 << OCF1A) | (1 << OCF1B)",
        "00001D BF 28         74     out TIFR, R18",
        "                     75",
        "                     76 wait_for_20ms_interval:",
        "00001E B6 28         77     in R2, TIFR",
        "00001F FE 26         78     sbrs R2, OCF1A",
        "                     79     rjmp wait_for_20ms_interval",
        "                        mnemonic_unknown",
        "                        clue: RJMP",
        "                     80",
        "                     81 get_next_char:",
        "                     82     lpm R20, Z+",
        "                        operand_offsetNotLdd",
        "                        location.operand: 1",
        "                        mnemonic_unknown",
        "                        clue: LPM",
        '000020 32 40         83     cpi R20, " ".charCodeAt(0)',
        "                     84     breq the_top",
        "                        mnemonic_unknown",
        "                        clue: BREQ",
        "                     85",
        "                     86 write_serial:",
        "000021 23 44         87     tst R20",
        "                     88     breq send_digit",
        "                        mnemonic_unknown",
        "                        clue: BREQ",
        "                     89",
        "                     90 buffer_wait:",
        "                     91     sbis UCSRA, UDRE",
        "                        mnemonic_unknown",
        "                        clue: SBIS",
        "                     92     rjmp buffer_wait",
        "                        mnemonic_unknown",
        "                        clue: RJMP",
        "                     93",
        "000022 B9 4C         94     out    UDR, R20",
        "                     95",
        "                     96     rjmp send_digit",
        "                        mnemonic_unknown",
        "                        clue: RJMP",
        "                     97",
        "                     98 digits_to_send:",
        '000023 54 65 73 74   99     {{ poke ("Testing1234 "); }}',
        "000025 69 6E 67 31",
        "000027 32 33 34 20",
        "                    100",
        "",
        "Symbol Table",
        "============",
        "",
        "baudSelector           | 95   | 5F  | /var/tmp/demo.asm:26 | 2",
        "buffer_wait            | 34   | 22  | /var/tmp/demo.asm:90 | 1",
        "clockSelect            | 4    | 4   | /var/tmp/demo.asm:26 | 1",
        "CS10                   | 0    | 0   | /var/tmp/demo.asm:1  | 3",
        "CS11                   | 1    | 1   | /var/tmp/demo.asm:1  | 2",
        "CS12                   | 2    | 2   | /var/tmp/demo.asm:1  | 2",
        "digits_to_send         | 35   | 23  | /var/tmp/demo.asm:98 | 0",
        "get_next_char          | 32   | 20  | /var/tmp/demo.asm:81 | 0",
        "OCF1A                  | 6    | 6   | /var/tmp/demo.asm:1  | 3",
        "OCF1B                  | 5    | 5   | /var/tmp/demo.asm:1  | 2",
        "OCR1AH                 | 75   | 4B  | /var/tmp/demo.asm:1  | 1",
        "OCR1AL                 | 74   | 4A  | /var/tmp/demo.asm:1  | 1",
        "R0                     |      |     | REGISTER             | 7",
        "R1                     |      |     | REGISTER             | 2",
        "R2                     |      |     | REGISTER             | 2",
        "R18                    |      |     | REGISTER             | 18",
        "R20                    |      |     | REGISTER             | 4",
        "send_digit             | 26   | 1A  | /var/tmp/demo.asm:69 | 2",
        "setup_serial           | 15   | F   | /var/tmp/demo.asm:51 | 0",
        "setup_timer            | 4    | 4   | /var/tmp/demo.asm:33 | 0",
        "start_interval_timers  | 11   | B   | /var/tmp/demo.asm:44 | 0",
        "TCCR1A                 | 79   | 4F  | /var/tmp/demo.asm:1  | 1",
        "TCCR1B                 | 78   | 4E  | /var/tmp/demo.asm:1  | 1",
        "TCNT1H                 | 77   | 4D  | /var/tmp/demo.asm:1  | 2",
        "TCNT1L                 | 76   | 4C  | /var/tmp/demo.asm:1  | 2",
        "the_top                | 24   | 18  | /var/tmp/demo.asm:65 | 1",
        "ticks                  | 1152 | 480 | /var/tmp/demo.asm:26 | 2",
        "TIFR                   | 88   | 58  | /var/tmp/demo.asm:1  | 3",
        "TXEN                   | 3    | 3   | /var/tmp/demo.asm:1  | 1",
        "UBRRH                  | 34   | 22  | /var/tmp/demo.asm:1  | 1",
        "UBRRL                  | 41   | 29  | /var/tmp/demo.asm:1  | 1",
        "UCSRA                  | 43   | 2B  | /var/tmp/demo.asm:1  | 2",
        "UCSRB                  | 42   | 2A  | /var/tmp/demo.asm:1  | 1",
        "UCSRC                  | 35   | 23  | /var/tmp/demo.asm:1  | 1",
        "UCSZ0                  | 1    | 1   | /var/tmp/demo.asm:1  | 1",
        "UCSZ1                  | 2    | 2   | /var/tmp/demo.asm:1  | 1",
        "UDR                    | 44   | 2C  | /var/tmp/demo.asm:1  | 1",
        "UDRE                   | 5    | 5   | /var/tmp/demo.asm:1  | 1",
        "wait_for_20ms_interval | 30   | 1E  | /var/tmp/demo.asm:76 | 1",
        "write_serial           | 33   | 21  | /var/tmp/demo.asm:86 | 0",
        "ZH                     |      |     | REGISTER             | 1",
        "ZL                     |      |     | REGISTER             | 1"
    ]);
});
