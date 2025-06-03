    {{ device("AT Tiny 24"); }}
back:
    NOP
    NOP
    NOP
    BRBC 5, back
    BRBC 4, forward
    BRBS 3, back
    BRBS 2, forward
    BRCC back
    BRCC forward
    BRCS back
    BRCS forward
    BREQ back
    BREQ forward
    BRGE back
    BRGE forward
    BRHC back
    BRHC forward
    BRHS back
    BRHS forward
    BRID back
    BRID forward
    BRIE back
    BRIE forward
    BRLO back
    BRLO forward
    BRLT back
    BRLT forward
    BRMI back
    BRMI forward
    BRNE back
    BRNE forward
    BRPL back
    BRPL forward
    BRSH back
    BRSH forward
    BRTC back
    BRTC forward
    BRTS back
    BRTS forward
    BRVC back
    BRVC forward
    BRVS back
    BRVS forward
    NOP
    NOP
    NOP
forward:
    NOP
