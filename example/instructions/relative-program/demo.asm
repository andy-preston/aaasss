    {{ device("AT Tiny 24"); }}
back:
    NOP
    NOP
    NOP
    RCALL back
    RJMP back
    RCALL forward
    RJMP forward
    NOP
    NOP
    NOP
forward:
    NOP
