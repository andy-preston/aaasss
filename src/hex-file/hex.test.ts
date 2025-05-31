import type { Code } from "../object-code/data-types.ts";

import { expect } from "jsr:@std/expect";
import { boringFailure } from "../failure/bags.ts";
import { dummyLine } from "../line/line-types.ts";
import { hexFile } from "./hex.ts";

const systemUnderTest = () => {
    const mockFileContents: Array<string> = [];
    const mockOutputFile = (_fileName: string, _extension: string) => ({
        "write": (text: string) => mockFileContents.push(text),
        "close": () => {},
        "remove": () => {},
        "empty": () => false
    });
    return {
        "mockFileContents": mockFileContents,
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

type Address = number;
type TestBlock = [Address, Array<Code>];

const testCode: Array<TestBlock> = [
    // As ever, obtained from my last, treasured version of GAVRASM
    [0x000000, [[0x24, 0x2c]              ]], //       MOV R2, R4
    [0x000001, [[0x53, 0x94]              ]], //       INC R5
    [0x000002, [[0x6a, 0x94]              ]], //       DEC R6
    [0x000003, [[0x03, 0x72]              ]], //       ANDI R16, 0x23
    [0x000004, [[0x22, 0x64]              ]], //       ORI R18, 0x42
    [0x000005, [[0x15, 0xe0]              ]], //       LDI R17, 5
    [0x000006, [[0x0a, 0xb8]              ]], // path: OUT 10, R0
    [0x000007, [[0x04, 0xb2]              ]], //       IN R0, 20 /
    [0x000008, [[0xe9, 0xf7]              ]], //       BRNE path
    [0x000009, [[0x0c, 0x94], [0x14, 0x00]]]  //       JMP 20
];

Deno.test("If there are any failures, no hex is produced", () => {
    const system = systemUnderTest();
    {
        const line = dummyLine(false, 1);
        line.address = 0x000000;
        line.code = [[1, 2], [3, 4]];
        system.hex.line(line);
    } {
        const line = dummyLine(false, 1).withFailures([
            boringFailure("syntax_invalidLabel")
        ]);
        system.hex.line(line);
    } {
        const line = dummyLine(false, 1);
        line.address = 0x000000;
        line.code = [[1, 2], [3, 4]];
        system.hex.line(line);
    }
    system.hex.close();
    expect(system.mockFileContents.length).toBe(0);
});

Deno.test("If no lines have code, no hex is produced", () => {
    const system = systemUnderTest();
    const line = dummyLine(false, 1);
    line.address = 0x000000;
    line.code = [];
    system.hex.line(line);
    system.hex.close();
    expect(system.mockFileContents.length).toBe(0);
});

Deno.test("Test data comes out the same as GAVRASM .HEX file", () => {
    const expectedResults = [
        ":020000020000FC",
        ":10000000242C53946A940372226415E00AB804B253",
        ":06001000E9F70C94140056",
        ":00000001FF"
    ];
    const system = systemUnderTest();
    const line = dummyLine(false, 1);
    for (const [address, code] of testCode) {
        line.address = address;
        line.code = code;
        system.hex.line(line);
    }
    system.hex.close();
    for (const [index, line] of system.mockFileContents.entries()) {
        expect(line).toBe(expectedResults[index]);
    }
});

Deno.test("Every file starts with an extended segment address of zero", () => {
    const system = systemUnderTest();
    const line = dummyLine(false, 1);
    line.address = 0x000000;
    line.code = [[1, 2], [3, 4]];
    system.hex.line(line);
    system.hex.close();
    expect(system.mockFileContents[0]).toBe(":020000020000FC");
});

Deno.test("Every file ends with an end-of-file marker", () => {
    const system = systemUnderTest();
    const line = dummyLine(false, 1);
    line.address = 0x000000;
    line.code = [[1, 2], [3, 4]];
    system.hex.line(line);
    system.hex.close();
    expect(system.mockFileContents.pop()).toBe(":00000001FF");
});

Deno.test("Each record begins with a start code", () => {
    const system = systemUnderTest();
    const line = dummyLine(false, 1);
    for (const [address, code] of testCode) {
        line.address = address;
        line.code = code;
        system.hex.line(line);
    }
    system.hex.close();
    for (const line of system.mockFileContents) {
        expect(line.startsWith(":")).toBe(true);
    }
});

Deno.test("Each record contains a maximum of 0x10 bytes", () => {
    const system = systemUnderTest();
    const line = dummyLine(false, 1);
    for (const [address, code] of testCode) {
        line.address = address;
        line.code = code;
        system.hex.line(line);
    }
    system.hex.close();
    const firstRecord = system.mockFileContents[1]!;
    expect(firstRecord.substring(1, 3)).toBe("10");
    expect(firstRecord.length).toBe(recordLength(0x10));
});

Deno.test("The remainder of the bytes form the last record", () => {
    const system = systemUnderTest();
    const line = dummyLine(false, 1);
    for (const [address, code] of testCode) {
        line.address = address;
        line.code = code;
        system.hex.line(line);
    }
    system.hex.close();
    const lastRecord = system.mockFileContents[2]!;
    expect(lastRecord.substring(1, 3)).toBe("06");
    expect(lastRecord.length).toBe(recordLength(6));
});

Deno.test("If the address jumps out of sequence, a new record starts", () => {
    const system = systemUnderTest();
    const outOfSequence: Array<TestBlock> = [
        [0x000000, [[1, 2]]],
        [0x000001, [[3, 4]]],

        [0x000010, [[5, 6]]],
        [0x000011, [[7, 8]]]
    ];
    const line = dummyLine(false, 1);
    for (const [address, code] of outOfSequence) {
        line.address = address;
        line.code = code;
        system.hex.line(line);
    }
    system.hex.close();
    expect(system.mockFileContents[1]).toBe(
        ":04" + "0000" + "00" + "01020304" + "F2"
    );
    expect(system.mockFileContents[2]).toBe(
        ":04" + "0020" + "00" + "05060708" + "C2"
    );
});

Deno.test("Long strings of bytes are stored in multiple records", () => {
    const system = systemUnderTest();
    const longString: Array<TestBlock> = [
        [0x000000, [[ 0,  1], [ 2,  3]]],
        [0x000002, [[ 4,  5], [ 6,  7]]],
        [0x000004, [[ 8,  9], [10, 11]]],
        [0x000006, [[12, 13], [14, 15]]],

        [0x000008, [[15, 14], [13, 12]]],
        [0x00000a, [[11, 10], [ 9,  8]]],
        [0x00000c, [[ 7,  6], [ 5,  4]]],
        [0x00000e, [[ 3,  2], [ 1,  0]]],

        [0x000010, [[0x48, 0x45], [0x4C, 0x4C]]],
        [0x000012, [[0x4F, 0x20], [0x48, 0x4F]]],
        [0x000014, [[0x4E, 0x4B], [0x59, 0x20]]],
        [0x000016, [[0x54, 0x4F], [0x4E, 0x4B]]],
        [0x000018, [[0x53, 0x21]              ]]
    ];
    const line = dummyLine(false, 1);
    for (const [address, code] of longString) {
        line.address = address;
        line.code = code;
        system.hex.line(line);
    }
    system.hex.close();
    expect(system.mockFileContents[1]).toEqual([
        ":10", "0000", "00",
            "00", "01", "02", "03",
            "04", "05", "06", "07",
            "08", "09", "0A", "0B",
            "0C", "0D", "0E", "0F",
        "78"
    ].join(""));
    expect(system.mockFileContents[2]).toEqual([
        ":10", "0010", "00",
            "0F", "0E", "0D", "0C",
            "0B", "0A", "09", "08",
            "07", "06", "05", "04",
            "03", "02", "01", "00",
        "68"
    ].join(""));
    expect(system.mockFileContents[3]).toEqual([
        ":10", "0020", "00",
            "48", "45", "4C", "4C",
            "4F", "20", "48", "4F",
            "4E", "4B", "59", "20",
            "54", "4F", "4E", "4B",
        "57"
    ].join(""));
    expect(system.mockFileContents[4]).toEqual([
        ":02", "0030", "00",
            "53", "21",
        "5A"
    ].join(""));
});
