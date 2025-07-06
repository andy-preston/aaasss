    .device("ATTiny24")
    ; Note that we're adding 0x20 to literal IO Address here
    IN R19, 25 + 0x20
    ; Because operands are given as data memory addresses
    ; (to be compatible with LDS and SDS)
    OUT 53 + 0x20, R16

    ; If you only use the pre-defined IO port labels, you don't need
    ; to care!
    IN R19, PINA
    OUT MCUCR, R16

    CBI PORTA, 5
    SBI PORTB, 0
    SBIC PINA, 6
    SBIC PINB, 3
