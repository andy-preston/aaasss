# AVR Assembler written in Deno/TypeScript/JavaScript

* macros
* memory allocation
* symbolic register names
* embedded JavaScript

In Loving Memory of
[GAVRASM](https://web.archive.org/web/20230918215305/http://www.avr-asm-tutorial.net/)

I miss being able to freely mix compile-time high-level code with my assembly
language... If you've ever used
[BBC Basic](http://www.riscos.com/support/developers/armlang/chap04.htm),
you'll know what I'm on about.

I'm hoping that when this is done, you'll be able to freely mix JavaScript in
with your assembly code and use it to calculate all sorts of stuff at
[comptime](https://ziglang.org/documentation/master/#comptime).

## Dependencies

* Deno

## Status

This is almost an M.V.P.
(Today it actually assembled a program that actually does something)

It blows my mind that it (almost) works.
It would blow my mind even more to find out someone else was using it.

I still don't trust the code it produces though... I like to double check it
against something more reliable... I like GAVRASM.

## Thank You For Inspiration

+ Gerhard Schmidt
+ Andrew Kelley
+ Sophie Wilson
+ Lingdong Huang
