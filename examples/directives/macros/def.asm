    ; A macro can be defined in one file and used in another
    .macro("aMacro", "address")
loopy:
    DEC R30
    BRNE loopy
    LDS R30, address
    .end()
