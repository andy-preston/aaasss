    .device("ATTiny2313")
    .include("/var/tmp/timing.js")

    cli
    clr R0

setup_timer:
    out TCCR1A, R0

    ldi R18, clockSelect
    out TCCR1B, R18

    ldi R18, high(ticks)
    out OCR1AH, R18
    ldi R18, low(ticks)
    out OCR1AL, R18

start_interval_timers:
    out TCNT1H, R0
    out TCNT1L, R0

    ldi R18, (1 << OCF1A) | (1 << OCF1B)
    out TIFR, R18

setup_serial:
    ldi R18, high(baudSelector)
    out UBRRH, R18
    ldi R18, low(baudSelector)
    out UBRRL, R18

    out UCSRA, R0

    ldi R18, (1 << TXEN)
    out UCSRB, R18

    ldi R18, (1 << UCSZ0) | (1 << UCSZ1)
    out UCSRC, R18

the_top:
    ldi ZL, low(characters_to_send << 1)
    ldi ZH, high(characters_to_send << 1)

send_character:
    out TCNT1H, R0
    out TCNT1L, R0

    ldi R18, (1 << OCF1A) | (1 << OCF1B)
    out TIFR, R18

wait_for_20ms_interval:
    in R1, TIFR
    sbrs R1, OCF1A
    rjmp wait_for_20ms_interval

get_next_character:
    lpm R19, Z+

buffer_wait:
    sbis UCSRA, UDRE
    rjmp buffer_wait

    out    UDR, R19

    cpi R19, " ".charCodeAt(0)
    breq the_top
    rjmp send_character

characters_to_send:
    .poke("Testing1234 ")
