; You need to specify a device before anything is assembled
    DES 12

; The device name needs to be a string
    .device(ATTiny24)

; Once the device is selected, we can access the IO Port names, etc
    .device("ATTiny24")
    LDS R30, ICR1H

; But only one device can be selected per assembly.
; Even if it's the same name as the previous one.
    .device("ATTiny24")
    .device("ATTiny2313")
