    .device("ATTiny24")
    .include("def.asm")
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

    ; A macro parameter could be used as part of an expression
    .macro("expressionMacro", "baseValue")
    LDI R23, baseValue + 5
    LDI R23, 15
    .end()
    .expressionMacro(10)

    ; Labels can be internal to a macro, or global across the program
outerLabel:
    nop
    nop
    nop
    .macro("jumpMacro")
innerLabel:
    rjmp outerLabel
    rjmp innerLabel
    .end()
    .jumpMacro()
    .jumpMacro()

    ; Should we expect to see LDS R30, 1024
    ;                      or LDS R30, address
    .aMacro(1024)
    .aMacro(2048)

    ; Macro parameters can only be numbers or strings
    .aMacro(false)
