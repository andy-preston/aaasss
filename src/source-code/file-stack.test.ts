import { assert, assertFalse, assertEquals, assertInstanceOf } from "assert";
import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { type Failure } from "../failure/failures.ts";
import { FileName } from "./data-types.ts";
import { defaultReaderMethod, fileStack } from "./file-stack.ts";

// cSpell:words plip wibble

const peculiarErrorMessage = (fileName: string) => {
    const prefix = "No such file or directory (os error 2)";
    const suffix = `: readfile '${fileName}': `;
    return `${prefix}${suffix}${prefix}${suffix}${prefix}`;
};

Deno.test("Including a file returns a blank value", () => {
    assertSuccess(
        // This file is irrelevant but we can guarantee it exists
        fileStack(defaultReaderMethod, "").include("deno.json"),
        ""
    );
});

Deno.test("Including a non existant file returns a failure", () => {
    const fileName = "does-not-exist.test";
    const result = fileStack(defaultReaderMethod, "").include(fileName);
    assertFailure(result, "file_notFound");
    const failure = result as Failure;
    assertInstanceOf(failure.extra, Deno.errors.NotFound);
    assertEquals(failure.extra.message, peculiarErrorMessage(fileName));
});

Deno.test("Including an 'irrational' fileName returns a failure", () => {
    const result = fileStack(defaultReaderMethod, "").include(
        [1, 2, 3] as unknown as string
    );
    assertFailure(result, "type_string");
    assertEquals((result as Failure).extra, "1,2,3");
});

Deno.test("Reading a file yields multiple lines with the file contents", () => {
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
