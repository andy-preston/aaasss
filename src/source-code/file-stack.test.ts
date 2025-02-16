import { assert, assertFalse, assertEquals, assertInstanceOf } from "assert";
import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { type Failure } from "../failure/failure-or-box.ts";
import { FileName } from "./data-types.ts";
import { defaultReaderMethod, fileStack, type FileLineIterator } from "./file-stack.ts";

Deno.test("Including a file doesn't return anything", () => {
    assertSuccess(
        // This file is irrelevant but we can guarantee it exists
        fileStack(defaultReaderMethod, "").include("deno.json"),
        undefined
    );
});

Deno.test("Including a non existant file returns a failure", () => {
    const fileName = "does-not-exist.test";
    const result = fileStack(defaultReaderMethod, "").include(fileName);
    assertFailure(result, "file_notFound");
    const failure = result as Failure;
    assertInstanceOf(failure.extra, Deno.errors.NotFound);
    assertEquals(
        failure.extra.message,
        `No such file or directory (os error 2): readfile '${fileName}'`
    );
});

Deno.test("Including an 'irrational' fileName returns a failure", () => {
    const result = fileStack(defaultReaderMethod, "").include(
        [1, 2, 3] as unknown as string
    );
    assertFailure(result, "type_string");
    assertEquals((result as Failure).extra, "1,2,3");
});

Deno.test("Reading a file yields multiple lines with the file contents", () => {
    // cSpell:words plip wibble
    const expectedLines = ["plip", "plop", "wibble", "wobble"];
    const files = fileStack(
        (_path: FileName) => expectedLines,
        "mock.test"
    );
    let index = 0;
    for (const line of files.lines()) {
        assertEquals(line.fileName, "mock.test");
        assertEquals(line.lineNumber, index + 1);
        assertEquals(line.rawSource, expectedLines[index]);
        assertFalse(line.failed());
        index = index + 1;
    }
});

Deno.test("Reading a non existant source file gives one line with a failure", () => {
    const files = fileStack(defaultReaderMethod, "does-not-exist.test");
    let lineCount = 0;
    for (const line of files.lines()) {
        assertEquals(line.fileName, "does-not-exist.test");
        assertEquals(line.lineNumber, 0);
        assertEquals(line.rawSource, "");
        assert(line.failed());
        line.failures().forEach((failure, index) => {
            assertEquals(index, 0);
            assertFailure(failure, "file_notFound");
        });
        lineCount = lineCount + 1;
    }
    assertEquals(lineCount, 1);
});

Deno.test("The last line of the top source file is flagged as such", () => {
    const expectedLines = ["not last", "not last", "not last", "last"];
    const files = fileStack(
        (_path: FileName) => expectedLines,
        "mock.test"
    );
    for (const line of files.lines()) {
        assertEquals(line.lastLine, line.rawSource == "last");
    }
});

Deno.test("An included file is inserted into the source stream", () => {
    const mockReader = (path: FileName) =>
        [1, 2, 3].map(line => `${path} ${line}`);

    const files = fileStack(mockReader, "top.file");
    const lines = files.lines();

    assertEquals("top.file 1", lines.next().value!.rawSource);
    files.include("plop.txt");
    assertEquals([
        "plop.txt 1",
        "plop.txt 2",
        "plop.txt 3",
        "top.file 2",
        "top.file 3",
    ], lines.toArray().map(line => line.rawSource));
});

Deno.test("Imaginary files (e.g. macros) can be included", () => {
    const mockReader = (path: FileName) =>
        [1, 2, 3].map(line => `${path} ${line}`);

    const files = fileStack(mockReader, "top.file");
    const lines = files.lines();

    const firstLine = lines.next().value!;
    assertEquals(firstLine.lineNumber, 1);
    assertEquals(firstLine.rawSource, "top.file 1");

    const imaginaryFile = function* (): FileLineIterator {
        yield ["one", "", 0, false];
        yield ["two", "", 0, false];
        yield ["three", "", 0, false];
    }
    files.pushImaginary(imaginaryFile());

    const expected = [
        [1, "one"], [1, "two"], [1, "three"],
        [2, "top.file 2"], [3, "top.file 3"],
    ];

    for (const [index, line] of lines.toArray().entries()) {
        assertEquals(line.fileName, "top.file");
        assertEquals(line.lineNumber, expected[index]![0]);
        assertEquals(line.rawSource, expected[index]![1]);
    }
});
