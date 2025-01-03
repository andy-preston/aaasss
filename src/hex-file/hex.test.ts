import { assert, assertEquals } from "assert";
import { lineWithRenderedJavascript } from "../embedded-js/line-types.ts";
import { lineWithExpandedMacro } from "../macro/line-types.ts";
import type { Code } from "../object-code/data-types.ts";
import { lineWithObjectCode } from "../object-code/line-types.ts";
import {
    lineWithAddress, lineWithPokedBytes
} from "../program-memory/line-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { hexFile } from "./hex.ts";

const testLine = (test: TestBlock) => {
    const withRaw = lineWithRawSource("", 0, false, "");
    const withRendered = lineWithRenderedJavascript(withRaw, "", []);
    const withTokens = lineWithTokens(withRendered, "", "", [], []);
    const withMacro = lineWithExpandedMacro(withTokens, withTokens, "", [], []);
    const withAddress = lineWithAddress(withMacro, test[0], []);
    const withPoked = lineWithPokedBytes(withAddress, [], []);
    return lineWithObjectCode(withPoked, [], test[1], []);
};

const testEnvironment = () => {
    const lines: Array<string> = [];
    const mockOutputFile = (_fileName: string, _extension: string) => ({
        "write": (text: string) => lines.push(text),
        "close": () => {},
        "remove": () => {}
    });
    return {
        "mockFileContents": lines,
        "hex": hexFile(mockOutputFile, "")
    };
};

const recordLength = (dataBytes: number): number => {
    // specification from https://en.wikipedia.org/wiki/Intel_HEX
    const startCodeLength = 1;
    const byteCountLength = 2;
    const addressLength = 4;
    const recordTypeLength = 2;
    const dataLength = dataBytes * 2;
    const checksumLength = 2;
    return startCodeLength + byteCountLength + addressLength +
        recordTypeLength + dataLength + checksumLength;
};

type TestBlock = [number, Code];

const testCode: Array<TestBlock> = [
    // As ever, obtained from my last, treasured version of GAVRASM
    [0x000000, [0x2c, 0x24]], //            MOV R2, R4
    [0x000001, [0x94, 0x53]], //            INC R5
    [0x000002, [0x94, 0x6a]], //            DEC R6
    [0x000003, [0x72, 0x03]], //            ANDI R16, 0x23
    [0x000004, [0x64, 0x22]], //            ORI R18, 0x42
    [0x000005, [0xe0, 0x15]], //            LDI R17, 5
    [0x000006, [0xb8, 0x0a]], //      path: OUT 10, R0
    [0x000007, [0xb2, 0x04]], //            IN R0, 20 /
    [0x000008, [0xf7, 0xe9]], //            BRNE path
    [0x000009, [0x94, 0x0c, 0x00, 0x14]] // JMP 20
];

Deno.test("Test data comes out the same as GAVRASM .HEX file", () => {
    const expectedResults = [
        ":020000020000FC",
        ":10000000242C53946A940372226415E00AB804B253",
        ":06001000E9F70C94140056",
        ":00000001FF"
    ];
    const environment = testEnvironment();
    for (const test of testCode) {
        environment.hex.line(testLine(test));
    }
    environment.hex.save();
    for (const [index, line] of environment.mockFileContents.entries()) {
        assertEquals(line, expectedResults[index]);
    }
});

Deno.test("Every file starts with an extended segment address of zero", () => {
    const environment = testEnvironment();
    environment.hex.save();
    assertEquals(":020000020000FC", environment.mockFileContents[0]);
});

Deno.test("Every file ends with an end-of-file marker", () => {
    const environment = testEnvironment();
    environment.hex.save();
    assertEquals(":00000001FF", environment.mockFileContents.pop());
});

Deno.test("Each record begins with a start code", () => {
    const environment = testEnvironment();
    for (const test of testCode) {
        environment.hex.line(testLine(test));
    }
    environment.hex.save();
    for (const line of environment.mockFileContents) {
        assert(line.startsWith(":"));
    }
});

Deno.test("Each record contains a maximum of 0x10 bytes", () => {
    const environment = testEnvironment();
    for (const test of testCode) {
        environment.hex.line(testLine(test));
    }
    environment.hex.save();
    const firstRecord = environment.mockFileContents[1]!;
    assertEquals("10", firstRecord.substring(1, 3));
    assertEquals(recordLength(16), firstRecord.length);
});

Deno.test("The remainder of the bytes form the last record", () => {
    const environment = testEnvironment();
    for (const test of testCode) {
        environment.hex.line(testLine(test));
    }
    environment.hex.save();
    const lastRecord = environment.mockFileContents[2]!;
    assertEquals("06", lastRecord.substring(1, 3));
    assertEquals(recordLength(6), lastRecord.length);
});

Deno.test("If the address jumps out of sequence, a new record starts", () => {
    const environment = testEnvironment();
    environment.hex.line(testLine([0x000000, [0x02, 0x01]]));
    environment.hex.line(testLine([0x000001, [0x04, 0x03]]));
    environment.hex.line(testLine([0x000010, [0x06, 0x05]]));
    environment.hex.line(testLine([0x000011, [0x08, 0x07]]));
    environment.hex.save();
    assertEquals(
        environment.mockFileContents[1],
        ":04" + "0000" + "00" + "01020304" + "F2"
    );
    assertEquals(
        environment.mockFileContents[2],
        ":04" + "0020" + "00" + "05060708" + "C2"
    );
});

Deno.test("Long strings of bytes are stored in multiple records", () => {
    const environment = testEnvironment();
    environment.hex.line(testLine([0x000000, [1, 0, 3, 2]]));
    environment.hex.line(testLine([0x000002, [5, 4, 7, 6]]));
    environment.hex.line(testLine([0x000004, [9, 8, 11, 10]]));
    environment.hex.line(testLine([0x000006, [13, 12, 15, 14]]));

    environment.hex.line(testLine([0x000008, [14, 15, 12, 13]]));
    environment.hex.line(testLine([0x00000a, [10, 11, 8, 9]]));
    environment.hex.line(testLine([0x00000c, [6, 7, 4, 5]]));
    environment.hex.line(testLine([0x00000e, [2, 3, 0, 1]]));

    environment.hex.line(testLine([0x000010, [0x45, 0x48, 0x4C, 0x4C]]));
    environment.hex.line(testLine([0x000012, [0x20, 0x4F, 0x4F, 0x48]]));
    environment.hex.line(testLine([0x000014, [0x4B, 0x4E, 0x20, 0x59]]));
    environment.hex.line(testLine([0x000016, [0x4F, 0x54, 0x4B, 0x4E]]));
    environment.hex.line(testLine([0x000018, [0x21, 0x53]]));
    environment.hex.save();
    assertEquals(environment.mockFileContents[1], [
        ":10", "0000", "00",
            "00", "01", "02", "03",
            "04", "05", "06", "07",
            "08", "09", "0A", "0B",
            "0C", "0D", "0E", "0F",
        "78"
    ].join(""));
    assertEquals(environment.mockFileContents[2], [
        ":10", "0010", "00",
            "0F", "0E", "0D", "0C",
            "0B", "0A", "09", "08",
            "07", "06", "05", "04",
            "03", "02", "01", "00",
        "68"
    ].join(""));
    assertEquals(environment.mockFileContents[3], [
        ":10", "0020", "00",
            "48", "45", "4C", "4C",
            "4F", "20", "48", "4F",
            "4E", "4B", "59", "20",
            "54", "4F", "4E", "4B",
        "57"
    ].join(""));
    assertEquals(environment.mockFileContents[4], [
        ":02", "0030", "00",
            "53", "21",
        "5A"
    ].join(""));
});
