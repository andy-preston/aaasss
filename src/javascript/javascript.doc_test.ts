import { docTest, expectFileContents } from "../assembler/doc-test.ts";

Deno.test("Defining methods to get high and low bytes", () => {
    const demo = docTest();
    demo.source("", [
        '    {{ device("ATTiny2313"); }}',
        "",
        "    {{ Number.prototype.high = function() {",
        "           return (this.valueOf() >> 8) & 0xff;",
        "       };",
        "       Number.prototype.low = function() {",
        "           return this.valueOf() & 0xff;",
        "       };",
        "    }}",
        "    {{ poke ((0xf00d).high()); }}",
        "    {{ poke ((0xf00d).low()); }}"
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny2313"); }}',
        "                      2",
        "                      3     {{ Number.prototype.high = function() {",
        "                      4            return (this.valueOf() >> 8) & 0xff;",
        "                      5        };",
        "                      6        Number.prototype.low = function() {",
        "                      7            return this.valueOf() & 0xff;",
        "                      8        };",
        "                      9     }}",
        "000000 F0 00         10     {{ poke ((0xf00d).high()); }}",
        "000001 0D 00         11     {{ poke ((0xf00d).low()); }}"
    ]);
});
