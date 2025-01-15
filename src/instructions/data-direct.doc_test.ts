import { assertEquals } from "assert";
import { docTest } from "../assembler/doc-test.ts";

Deno.test("Data-direct without reduced core",() => {
    const demo = docTest().deviceSpec({
        "unsupportedInstructions": { "value": [] },
        "programEnd": { "value": "0100" },
        "reducedCore": { "value": false }
    }).source([
        '    {{ device("testing"); }}',
        "    LDS R30, 512 * 2",
        "    STS 1024 * 4, R8",
    ]);
    demo.assemble();
    assertEquals(demo.listing(), [
        "demo.asm",
        "========",
        '                      1     {{ device("testing"); }}',
        "000000 91 E0 04 00    2     LDS R30, 512 * 2",
        "000002 92 80 10 00    3     STS 1024 * 4, R8"
    ]);
    // This comes from the last version of GAVRAsm that I could get hold of.
    assertEquals(demo.hexFile(), [
        ":020000020000FC",
        ":08000000E09100048092001061",
        ":00000001FF"
    ]);
});

Deno.test("Data-direct with reduced core",() => {
    const demo = docTest().deviceSpec({
        "unsupportedInstructions": { "value": [] },
        "programEnd": { "value": "0100" },
        "reducedCore": { "value": true }
    }).source([
        '    {{ device("ATtiny20"); }}',
        "    LDS R30, 12 * 10",
        "    STS 126, R18"
    ]);
    demo.assemble();
    assertEquals(demo.listing(), [
        "demo.asm",
        "========",
        '                      1     {{ device("ATtiny20"); }}',
        "000000 A7 E8          2     LDS R30, 12 * 10",
        "000001 AF 2E          3     STS 126, R18"
    ]);
    // This comes from the last version of GAVRAsm that I could get hold of.
    assertEquals(demo.hexFile(), [
        ":020000020000FC",
        ":04000000E8A72EAF90",
        ":00000001FF"
    ]);
});
