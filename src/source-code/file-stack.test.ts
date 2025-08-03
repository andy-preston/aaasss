import type { ClueFailure } from "../failure/bags.ts";
import type { FileLineIterator, FileName } from "./data-types.ts";

import { expect } from "jsr:@std/expect";
import { defaultReaderMethod } from "./file-stack.ts";
import { testSystem } from "./testing.ts";

Deno.test("Including a non existant file fails", () => {
    const fileName = "does-not-exist.test";
    const systemUnderTest = testSystem(defaultReaderMethod, "");
    systemUnderTest.fileStack.include(fileName);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as ClueFailure;
    expect(failure.kind).toBe("file_notFound");
    expect(failure.clue).toBe(
        `No such file or directory (os error 2): readfile '${fileName}'`
    );
});

Deno.test("Reading a file yields multiple lines with the file contents", () => {
    const systemUnderTest = testSystem(
        (_path: FileName) => expected, "mock.test"
    );
    const expected = ["one", "two", "three", "four"];
    let lineNumber = 0;
    const mockPipeline = () => {
        lineNumber = lineNumber + 1;
        expect(systemUnderTest.currentLine().fileName).toBe("mock.test");
        expect(systemUnderTest.currentLine().lineNumber).toBe(lineNumber);
        expect(systemUnderTest.currentLine().sourceCode).toBe(
            expected[lineNumber - 1]
        );
        expect(systemUnderTest.currentLine().failures.length).toBe(0);
    }
    systemUnderTest.fileStack.lines(mockPipeline, () => {});
    expect(lineNumber).toBe(expected.length);
});

Deno.test("The last line of a file is tagged with EOF", () => {
    const expectedLines = ["no", "no", "no", "yes"];
    const systemUnderTest = testSystem(
        (_path: FileName) => expectedLines,
        "mock.test"
    );
    let lineNumber = 0;
    const mockPipeline = () => {
        lineNumber = lineNumber + 1;
        expect(
            systemUnderTest.currentLine().eof
        ).toBe(
            systemUnderTest.currentLine().sourceCode == "yes"
        );
    };
    systemUnderTest.fileStack.lines(mockPipeline, () => {});
    expect(lineNumber).toBe(expectedLines.length);
});

Deno.test("Reading a non existant source file gives one line with a failure", () => {
    const systemUnderTest = testSystem(defaultReaderMethod, "not-exist.test");
    let lineNumber = 0;
    const mockPipeline = () => {
        lineNumber = lineNumber + 1;
        expect(systemUnderTest.currentLine().fileName).toBe("not-exist.test");
        expect(systemUnderTest.currentLine().lineNumber).toBe(0);
        expect(systemUnderTest.currentLine().sourceCode).toBe("");
        expect(systemUnderTest.currentLine().failures.length).toBe(1);
        const failure =
            systemUnderTest.currentLine().failures[0] as ClueFailure;
        expect(failure.kind).toBe("file_notFound");
        expect(failure.clue).toBe(
            "No such file or directory (os error 2): readfile 'not-exist.test'"
        );
    };
    systemUnderTest.fileStack.lines(mockPipeline, () => {});
    expect(lineNumber).toBe(1);
});

Deno.test("An included file is inserted into the source stream", () => {
    const mockReader = (path: FileName) =>
        [1, 2, 3].map(line => `${path} ${line}`);
    const expected = [
        "/path/top.file 1",
        "/path/plop.txt 1", "/path/plop.txt 2", "/path/plop.txt 3",
        "/path/top.file 2", "/path/top.file 3"
    ];
    const systemUnderTest = testSystem(mockReader, "/path/top.file");
    let lineNumber = 0;
    const mockPipeline = () => {
        lineNumber = lineNumber + 1;
        expect(systemUnderTest.currentLine().sourceCode).toBe(
            expected[lineNumber - 1]
        );
        expect(systemUnderTest.currentLine().failures.length).toBe(0);
        if (lineNumber == 1) {
            systemUnderTest.fileStack.include("plop.txt");
            expect(systemUnderTest.currentLine().failures.length).toBe(0);
        }
    };
    systemUnderTest.fileStack.lines(mockPipeline, () => {});
    expect(lineNumber).toBe(expected.length);
});

Deno.test("Imaginary files (e.g. macros) can be included", () => {
    const mockReader = (path: FileName) =>
        [1, 2, 3].map(line => `${path} ${line}`);
    const imaginaryFile = function* (): FileLineIterator {
        yield ["one", "", false];
        yield ["two", "", false];
        yield ["three", "", false];
    }
    const expected: Array<[number, string]> = [
        [1, "top.file 1"],
        [1, "one"       ], [1, "two"       ], [1, "three"],
        [2, "top.file 2"], [3, "top.file 3"]
    ];
    const systemUnderTest = testSystem(mockReader, "top.file");
    let lineNumber = 0;
    const mockPipeline = () => {
        lineNumber = lineNumber + 1;
        const [expectedLineNumber, expectedSource] = expected[lineNumber - 1]!;
        const actual = systemUnderTest.currentLine();
        expect(actual.fileName).toBe("top.file");
        expect(actual.lineNumber).toBe(expectedLineNumber);
        expect(actual.sourceCode).toBe(expectedSource);
        expect(actual.failures.length).toBe(0);
        if (lineNumber == 1) {
            systemUnderTest.fileStack.pushImaginary(imaginaryFile());
            expect(systemUnderTest.currentLine().failures.length).toBe(0);
        }
    };
    systemUnderTest.fileStack.lines(mockPipeline, () => {});
    expect(lineNumber).toBe(expected.length);
});
