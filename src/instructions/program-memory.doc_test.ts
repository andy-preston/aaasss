import { docTest, expectFileContents } from "../demos-as-tests/doc-test.ts";

Deno.test("Program Memory Demo", () => {
    const demo = docTest();
    demo.mockUnsupportedDevice({
        "unsupportedInstructions": [],
        "programMemoryBytes": 0x0100,
        "reducedCore": false
    });
    demo.source("", [
        '    {{ device("Fake Device"); }}',
        "    SPM",
        "    SPM Z+",
        "    ELPM",
        "    ELPM R12, Z",
        "    ELPM R13, Z+",
        "    LPM R25, Z",
        "    LPM R26, Z+"
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("Fake Device"); }}',
        "000000 E8 95          2     SPM",
        "000001 F8 95          3     SPM Z+",
        "000002 D8 95          4     ELPM",
        "000003 C6 90          5     ELPM R12, Z",
        "000004 D7 90          6     ELPM R13, Z+",
        "000005 94 91          7     LPM R25, Z",
        "000006 A5 91          8     LPM R26, Z+",
        "",
        "Symbol Table",
        "============",
        "",
        "R12 |   |   | REGISTER | 1",
        "R13 |   |   | REGISTER | 1",
        "R25 |   |   | REGISTER | 1",
        "R26 |   |   | REGISTER | 1"
    ]);
    expectFileContents(".hex").toEqual([
        ":020000020000FC",
        ":0E000000E895F895D895C690D7909491A59163",
        ":00000001FF"
    ]);
});

Deno.test("If ELPM is supported, implicit LPM cannot be used", () => {
    const demo = docTest();
    demo.mockUnsupportedDevice({
        "unsupportedInstructions": [],
        "programMemoryBytes": 0x0100
    });
    demo.source("", [
        '    {{ device("testing"); }}',
        "    LPM",
        "    ELPM"
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("testing"); }}',
        "000000 D8 95          2     LPM",
        "                        mnemonic_implicitElpmNotLpm",
        "000001 D8 95          3     ELPM",
    ]);
});

Deno.test("The address is always implicit or held in Z", () => {
    const demo = docTest();
    demo.mockUnsupportedDevice({
        "unsupportedInstructions": [],
        "programMemoryBytes": 0x0100,
        "reducedCore": false
    });
    demo.source("", [
        '    {{ device("Fake Device"); }}',
        "    SPM X",
        "    ELPM R12, 10",
        "    LPM R25, Y",
        "    LPM R26, -Y"
    ]);
    demo.assemble();
    expectFileContents(".lst").toEqual([
        "/var/tmp/demo.asm",
        "=================",
        '                      1     {{ device("Fake Device"); }}',

        "000000 E8 95          2     SPM X",
        "                        operand_symbolic",
        "                        location.operand: 0",
        "                        expected: Z+",
        "                        actual: X",

        "000001 C6 90          3     ELPM R12, 10",
        "                        type_failure",
        "                        location.operand: 1",
        "                        expected: index",
        "                        actual: number",

        "                        operand_symbolic",
        "                        location.operand: 1",
        "                        expected: Z/Z+",
        "                        actual: 10",

        "000002 94 91          4     LPM R25, Y",
        "                        operand_symbolic",
        "                        location.operand: 1",
        "                        expected: Z/Z+",
        "                        actual: Y",

        "000003 A4 91          5     LPM R26, -Y",
        "                        operand_symbolic",
        "                        location.operand: 1",
        "                        expected: Z/Z+",
        "                        actual: -Y",
        "",
        "Symbol Table",
        "============",
        "",
        "R12 |   |   | REGISTER | 1",
        "R25 |   |   | REGISTER | 1",
        "R26 |   |   | REGISTER | 1"
    ]);
});
