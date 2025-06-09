    {{ device("ATMega 328"); }}

    POP R6
    PUSH R7
    COM R14
    DEC R22
    INC R20
    LSR R6
    ASR R10
    NEG R11
    SWAP R7
    ROR R19

    ADC R1, R2
    ADD R3, R4
    AND R7, R8
    CLR R14
    CP R15, R16
    CPC R17, R18
    CPSE R20, R21
    EOR R23, R0
    LSL R5
    MOV R7, R8
    MUL R8, R16
    OR R12, R13
    ROL R20
    SBC R20, R2
    SUB R1, R2
    TST R8

    FMUL R16, R23
    FMULS R17, R20
    FMULSU R18, R21
    MULS R16, R31
    MULSU R16, R18

    MOVW R0, R30
