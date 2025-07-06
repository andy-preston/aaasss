    .device("ATTiny24")

    CPI R16, 0
    CPI R31, 0
    CPI R16, 255
    CPI R19, 53
    SBCI R18, 19
    SUBI R17, 47
    ORI R17, 86
    SBR R19, 64
    ANDI R20, 6
    CBR R23, 128
    LDI R17, 77
    LDI R17, complement(-128)
    LDI R19, 255
    SER R19

    ADIW R26, 5
    SBIW R26, 57
