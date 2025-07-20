    .device("ATTiny24")

    LD R14, X
    LD R15, X+
    LD R16, -X
    LD R17, Y
    LD R18, Y+
    LD R19, -Y
    LD R21, Z
    LD R22, Z+
    LD R23, -Z

    ST X, R0
    ST X+, R1
    ST -X, R2
    ST Y, R3
    ST Y+, R4
    ST -Y, R5
    ST Z, R7
    ST Z+, R8
    ST -Z, R9

    LDD R20, Y+8
    LDD R24, Z+6

    STD Y+9, R6
    STD Z+13, R10
