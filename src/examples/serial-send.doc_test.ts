import { assertFileContains, docTest } from "../assembler/doc-test.ts";

Deno.test("serial-send Demo", () => {
    const demo = docTest();
    demo.source([
        '    {{ device("ATTiny2313"); }}',
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
        "    ldi R18, high(95)",
        "    out UBRRH, R18",
        "    ldi R18, low(95)",
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
    assertFileContains(".lst", [
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny2313"); }}',
        "000000 94 F8          2     cli",
        "000001 24 00          3     clr R0",
        "000002 24 11          4     clr R1",
        "                      5     dec R1",
        "                        mnemonic_unknown",
        "                        clue: DEC",
        "                      6",
        "                      7 setup_timer:",
        "                      8     out TCCR1A, R0",
        "                        mnemonic_unknown",
        "                        clue: OUT",
        "                      9",
        "                     10     ldi R18, (1 << CS12)",
        "                        mnemonic_unknown",
        "                        clue: LDI",
        "                     11     out TCCR1B, R18",
        "                        mnemonic_unknown",
        "                        clue: OUT",
        "                     12",
        "                     13     ldi R18, high(1152)",
        "                        mnemonic_unknown",
        "                        clue: LDI",
        "                     14     out OCR1AH, R18",
        "                        mnemonic_unknown",
        "                        clue: OUT",
        "                     15     ldi R18, low(1152)",
        "                        mnemonic_unknown",
        "                        clue: LDI",
        "                     16     out OCR1AL, R18",
        "                        mnemonic_unknown",
        "                        clue: OUT",
        "                     17",
        "                     18 start_interval_timers:",
        "                     19     out TCNT1H, R0",
        "                        mnemonic_unknown",
        "                        clue: OUT",
        "                     20     out TCNT1L, R0",
        "                        mnemonic_unknown",
        "                        clue: OUT",
        "                     21",
        "                     22     ldi R18, (1 << OCF1A) | (1 << OCF1B)",
        "                        mnemonic_unknown",
        "                        clue: LDI",
        "                     23     out TIFR, R18",
        "                        mnemonic_unknown",
        "                        clue: OUT",
        "                     24",
        "                     25 setup_serial:",
        "                     26     ldi R18, high(95)",
        "                        mnemonic_unknown",
        "                        clue: LDI",
        "                     27     out UBRRH, R18",
        "                        mnemonic_unknown",
        "                        clue: OUT",
        "                     28     ldi R18, low(95)",
        "                        mnemonic_unknown",
        "                        clue: LDI",
        "                     29     out UBRRL, R18",
        "                        mnemonic_unknown",
        "                        clue: OUT",
        "                     30",
        "                     31     out UCSRA, R0",
        "                        mnemonic_unknown",
        "                        clue: OUT",
        "                     32",
        "                     33     ldi R18, (1 << TXEN)",
        "                        mnemonic_unknown",
        "                        clue: LDI",
        "                     34     out UCSRB, R18",
        "                        mnemonic_unknown",
        "                        clue: OUT",
        "                     35",
        "                     36     ldi R18, (1 << UCSZ0) | (1 << UCSZ1)",
        "                        mnemonic_unknown",
        "                        clue: LDI",
        "                     37     out UCSRC, R18",
        "                        mnemonic_unknown",
        "                        clue: OUT",
        "                     38",
        "                     39 the_top:",
        "                     40     ldi ZL, low(digits_to_send << 1)",
        "                        mnemonic_unknown",
        "                        clue: LDI",
        "                     41     ldi ZH, high(digits_to_send << 1)",
        "                        mnemonic_unknown",
        "                        clue: LDI",
        "                     42",
        "                     43 send_digit:",
        "                     44     out TCNT1H, R0",
        "                        mnemonic_unknown",
        "                        clue: OUT",
        "                     45     out TCNT1L, R0",
        "                        mnemonic_unknown",
        "                        clue: OUT",
        "                     46",
        "                     47     ldi R18, (1 << OCF1A) | (1 << OCF1B)",
        "                        mnemonic_unknown",
        "                        clue: LDI",
        "                     48     out TIFR, R18",
        "                        mnemonic_unknown",
        "                        clue: OUT",
        "                     49",
        "                     50 wait_for_20ms_interval:",
        "                     51     in R2, TIFR",
        "                        mnemonic_unknown",
        "                        clue: IN",
        "                     52     sbrs R2, OCF1A",
        "                        mnemonic_unknown",
        "                        clue: SBRS",
        "                     53     rjmp wait_for_20ms_interval",
        "                        mnemonic_unknown",
        "                        clue: RJMP",
        "                     54",
        "                     55 get_next_char:",
        "                     56     lpm R20, Z+",
        "                        operand_offsetNotLdd",
        "                        operand: 1",
        "                        mnemonic_unknown",
        "                        clue: LPM",
        '                     57     cpi R20, " ".charCodeAt(0)',
        "                        mnemonic_unknown",
        "                        clue: CPI",
        "                     58     breq the_top",
        "                        mnemonic_unknown",
        "                        clue: BREQ",
        "                     59",
        "                     60 write_serial:",
        "000003 23 44         61     tst R20",
        "                     62     breq send_digit",
        "                        mnemonic_unknown",
        "                        clue: BREQ",
        "                     63",
        "                     64 buffer_wait:",
        "                     65     sbis UCSRA, UDRE",
        "                        mnemonic_unknown",
        "                        clue: SBIS",
        "                     66     rjmp buffer_wait",
        "                        mnemonic_unknown",
        "                        clue: RJMP",
        "                     67",
        "                     68     out    UDR, R20",
        "                        mnemonic_unknown",
        "                        clue: OUT",
        "                     69",
        "                     70     rjmp send_digit",
        "                        mnemonic_unknown",
        "                        clue: RJMP",
        "                     71",
        "                     72 digits_to_send:",
        '000004 54 65 73 74   73     {{ poke ("Testing1234 "); }}',
        "000006 69 6E 67 31",
        "000008 32 33 34 20",
        "                     74",
        "",
        "Symbol Table",
        "============",
        "",
        "buffer_wait = 4 (1) /var/tmp/demo.asm:64",
        "CS12 = 2 (1)",
        "digits_to_send = 4 (0) /var/tmp/demo.asm:72",
        "get_next_char = 3 (0) /var/tmp/demo.asm:55",
        "OCF1A = 6 (3)",
        "OCF1B = 5 (2)",
        "OCR1AH = 75 (1)",
        "OCR1AL = 74 (1)",
        "R0 (7)",
        "R1 (2)",
        "R2 (2)",
        "R18 (18)",
        "R20 (4)",
        "send_digit = 3 (2) /var/tmp/demo.asm:43",
        "setup_serial = 3 (0) /var/tmp/demo.asm:25",
        "setup_timer = 3 (0) /var/tmp/demo.asm:7",
        "start_interval_timers = 3 (0) /var/tmp/demo.asm:18",
        "TCCR1A = 79 (1)",
        "TCCR1B = 78 (1)",
        "TCNT1H = 77 (2)",
        "TCNT1L = 76 (2)",
        "the_top = 3 (1) /var/tmp/demo.asm:39",
        "TIFR = 88 (3)",
        "TXEN = 3 (1)",
        "UBRRH = 34 (1)",
        "UBRRL = 41 (1)",
        "UCSRA = 43 (2)",
        "UCSRB = 42 (1)",
        "UCSRC = 35 (1)",
        "UCSZ0 = 1 (1)",
        "UCSZ1 = 2 (1)",
        "UDR = 44 (1)",
        "UDRE = 5 (1)",
        "wait_for_20ms_interval = 3 (1) /var/tmp/demo.asm:50",
        "write_serial = 3 (0) /var/tmp/demo.asm:60",
        "ZH (1)",
        "ZL (1)",
    ]);
});
