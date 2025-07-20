    .device("AT Tiny 2313")

    ; Poke inserts bytes directly into the object file

    ; This odd number of bytes will be zero padded to word align
    .poke(1, 2, 3, 4, 5, 6, 7)
    .poke("Hello there!")

    .include("/var/tmp/poke1.js")
    .include("/var/tmp/poke2.js")

    ; You can put a label on your data
here: .poke(0xff)
