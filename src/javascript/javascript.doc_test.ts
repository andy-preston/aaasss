import { docTest, expectFileContents } from "../demos-as-tests/doc-test.ts";

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

Deno.test("Including plain Javascript files", () => {
    const demo = docTest();
    demo.source("", [
        '    {{ device("ATTiny2313"); }}',
        '    {{ include("/var/tmp/test.js"); }}',
        "    LDI r16, testValue"
    ]);
    demo.source("test.js", [
        'define ("testValue", 127 * 2);',
        "const values = [0x23, 0x42];",
        "poke (...values);"
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("ATTiny2313"); }}',
        '                      2     {{ include("/var/tmp/test.js"); }}',
        "",
        "/var/tmp/test.js",
        "================",
        '                      1 define ("testValue", 127 * 2);',
        "                      2 const values = [0x23, 0x42];",
        "000000 23 42          3 poke (...values);",
        "",
        "/var/tmp/demo.asm",
        "=================",
        "000001 0E EF          3     LDI r16, testValue",
        "",
        "Symbol Table",
        "============",
        "",
        "R16       |     |    | REGISTER           | 1",
        "testValue | 254 | FE | /var/tmp/test.js:3 | 1",
    ]);
});
