    ; A macro can be defined in one file and used in another
    {{ macro("aMacro", "address"); }}
    LDS R30, address
    {{ end(); }}
