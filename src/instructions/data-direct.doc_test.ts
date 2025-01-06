import { assertEquals } from "assert";
import { testEnvironment } from "../pipeline/doc-test-environment.ts";

Deno.test("Data-direct without reduced core",() => {
    const environment = testEnvironment().deviceSpec({
        "unsupportedInstructions": { "value": [] },
        "programEnd": { "value": "0100" },
        "reducedCore": { "value": false }
    }).source([
        '    {{ device("testing") }}',
        "    LDS R30, 1024",
        "    STS 4096, R8",
    ]);
    environment.assemble();
    assertEquals(environment.listing(), [
        "mock.asm",
        "========",
        "",
        '                     1     {{ device("testing") }}',
        "00000 91 E0 04 00    2     LDS R30, 1024",
        "00002 92 80 10 00    3     STS 4096, R8"
    ]);
    // The comes from the last version of GAVRAsm that I could get hold of.
    assertEquals(environment.hexFile(), [
        ":020000020000FC",
        ":08000000E09100048092001061",
        ":00000001FF"
    ]);
});

Deno.test("Data-direct without reduced core",() => {
    const environment = testEnvironment().deviceSpec({
        "unsupportedInstructions": { "value": [] },
        "programEnd": { "value": "0100" },
        "reducedCore": { "value": true }
    }).source([
        '    {{ device("testing") }}',
        "    LDS R30, 120",
        "    STS 126, R18"
    ]);
    environment.assemble();
    assertEquals(environment.listing(), [
        "mock.asm",
        "========",
        "",
        '                     1     {{ device("testing") }}',
        "00000 A7 E8          2     LDS R30, 120",
        "00001 AF 2E          3     STS 126, R18"

    ]);
});
