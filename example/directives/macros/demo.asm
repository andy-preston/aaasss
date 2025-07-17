    .device("ATTiny24")
    .include("/var/tmp/def.asm")
    .aMacro(1024)

    ; Any directives included in a macro will be recorded
    ; but not be executed during definition
    .macro("pokingMacro")
    .poke("testing")
    LDI R30, 23
    .end()

    .pokingMacro()

    ; A macro can be called from inside another macro
    .macro("innerMacro", "address")
    LDS R30, address
    .end()

    .macro("outerMacro")
    .innerMacro(1024)
    .innerMacro(2048)
    .end()

    .outerMacro()

    ; Playing back multiple copies of a macro with JS
    ; Doing stuff in a loop means that the macros get expanded in
    ; reverse order - hence the reversing of the array
    .([1024, 2048].reverse().forEach(a => aMacro(a)))

    ; Should we expect to see LDS R30, 1024
    ;                      or LDS R30, address
    ; And should macro parameters end up in the symbol table
    .aMacro(1024)

    .aMacro(2048)

    ; You can use anything for a macros parameters
    ; But you'll get errors when they're used if you pass
    ; something "peculiar"
    .aMacro(false)
