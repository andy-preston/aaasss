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
        '    cpi R20, char(" ")',
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
        "                      2     cli",
        "                        mnemonic_unknown",
        "                      3     clr R0",
        "                        mnemonic_unknown",
        "                      4     clr R1",
        "                        mnemonic_unknown",
        "                      5     dec R1",
        "                        mnemonic_unknown",
        "                      6",
        "                      7 setup_timer:",
        "                        symbol_notUsed",
        "                      8     out TCCR1A, R0",
        "                        mnemonic_unknown",
        "                      9",
        "                     10     ldi R18, (1 << CS12)",
        "                        mnemonic_unknown",
        "                     11     out TCCR1B, R18",
        "                        mnemonic_unknown",
        "                     12",
        "                     13     ldi R18, high(1152)",
        "                        mnemonic_unknown",
        "                     14     out OCR1AH, R18",
        "                        mnemonic_unknown",
        "                     15     ldi R18, low(1152)",
        "                        mnemonic_unknown",
        "                     16     out OCR1AL, R18",
        "                        mnemonic_unknown",
        "                     17",
        "                     18 start_interval_timers:",
        "                        symbol_notUsed",
        "                     19     out TCNT1H, R0",
        "                        mnemonic_unknown",
        "                     20     out TCNT1L, R0",
        "                        mnemonic_unknown",
        "                     21",
        "                     22     ldi R18, (1 << OCF1A) | (1 << OCF1B)",
        "                        mnemonic_unknown",
        "                     23     out TIFR, R18",
        "                        mnemonic_unknown",
        "                     24",
        "                     25 setup_serial:",
        "                        symbol_notUsed",
        "                     26     ldi R18, high(95)",
        "                        mnemonic_unknown",
        "                     27     out UBRRH, R18",
        "                        mnemonic_unknown",
        "                     28     ldi R18, low(95)",
        "                        mnemonic_unknown",
        "                     29     out UBRRL, R18",
        "                        mnemonic_unknown",
        "                     30",
        "                     31     out UCSRA, R0",
        "                        mnemonic_unknown",
        "                     32",
        "                     33     ldi R18, (1 << TXEN)",
        "                        mnemonic_unknown",
        "                     34     out UCSRB, R18",
        "                        mnemonic_unknown",
        "                     35",
        "                     36     ldi R18, (1 << UCSZ0) | (1 << UCSZ1)",
        "                        mnemonic_unknown",
        "                     37     out UCSRC, R18",
        "                        mnemonic_unknown",
        "                     38",
        "                     39 the_top:",
        "                     40     ldi ZL, low(digits_to_send << 1)",
        "                        mnemonic_unknown",
        "                     41     ldi ZH, high(digits_to_send << 1)",
        "                        mnemonic_unknown",
        "                     42",
        "                     43 send_digit:",
        "                     44     out TCNT1H, R0",
        "                        mnemonic_unknown",
        "                     45     out TCNT1L, R0",
        "                        mnemonic_unknown",
        "                     46",
        "                     47     ldi R18, (1 << OCF1A) | (1 << OCF1B)",
        "                        mnemonic_unknown",
        "                     48     out TIFR, R18",
        "                        mnemonic_unknown",
        "                     49",
        "                     50 wait_for_20ms_interval:",
        "                     51     in R2, TIFR",
        "                        mnemonic_unknown",
        "                     52     sbrs R2, OCF1A",
        "                        mnemonic_unknown",
        "                     53     rjmp wait_for_20ms_interval",
        "                        mnemonic_unknown",
        "                     54",
        "                     55 get_next_char:",
        "                        symbol_notUsed",
        "                     56     lpm R20, Z+",
        "                        operand_offsetNotLdd",
        "",
        "                        mnemonic_unknown",
        '                     57     cpi R20, char(" ")',
        "                        js_error",
        "                        ReferenceError",
        "                        char is not defined",
        "                        mnemonic_unknown",
        "                     58     breq the_top",
        "                        mnemonic_unknown",
        "                     59",
        "                     60 write_serial:",
        "                        symbol_notUsed",
        "                     61     tst R20",
        "                        mnemonic_unknown",
        "                     62     breq send_digit",
        "                        mnemonic_unknown",
        "                     63",
        "                     64 buffer_wait:",
        "                     65     sbis UCSRA, UDRE",
        "                        mnemonic_unknown",
        "                     66     rjmp buffer_wait",
        "                        mnemonic_unknown",
        "                     67",
        "                     68     out    UDR, R20",
        "                        mnemonic_unknown",
        "                     69",
        "                     70     rjmp send_digit",
        "                        mnemonic_unknown",
        "                     71",
        "                     72 digits_to_send:",
        "                        symbol_redefined",
        '000000 54 65 73 74   73     {{ poke ("Testing1234 "); }}',
        "000002 69 6E 67 31",
        "000004 32 33 34 20",
        "                     74",
        "",
        "Symbol Table",
        "============",
        "",
        "buffer_wait: 1",
        "CS12: 1",
        "digits_to_send: 2",
        "get_next_char: 0",
        "OCF1A: 3",
        "OCF1B: 2",
        "OCR1AH: 1",
        "OCR1AL: 1",
        "R0: 7",
        "R1: 2",
        "R2: 2",
        "R18: 18",
        "R20: 4",
        "send_digit: 2",
        "setup_serial: 0",
        "setup_timer: 0",
        "start_interval_timers: 0",
        "TCCR1A: 1",
        "TCCR1B: 1",
        "TCNT1H: 2",
        "TCNT1L: 2",
        "the_top: 1",
        "TIFR: 3",
        "TXEN: 1",
        "UBRRH: 1",
        "UBRRL: 1",
        "UCSRA: 2",
        "UCSRB: 1",
        "UCSRC: 1",
        "UCSZ0: 1",
        "UCSZ1: 1",
        "UDR: 1",
        "UDRE: 1",
        "wait_for_20ms_interval: 1",
        "write_serial: 0",
        "ZH: 1",
        "ZL: 1"
    ]);
});
