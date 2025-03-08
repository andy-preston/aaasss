import { assert, assertFalse, assertEquals } from "assert";
import { directiveFunction } from "../directives/directive-function.ts";
import { extractedFailures, FileNotFoundFailure } from "../failure/bags.ts";
import { assertFailures, assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { FileName } from "./data-types.ts";
import { defaultReaderMethod, fileStack, type FileLineIterator } from "./file-stack.ts";

const irrelevantName = "testing";

Deno.test("Including a file doesn't return anything", () => {
    const irrelevantButRealFile = "deno.json";
    const aFileStack = fileStack(defaultReaderMethod, "");
    const include = directiveFunction(
        irrelevantName, aFileStack.includeDirective
    );
    assertSuccess(include(irrelevantButRealFile));
});

Deno.test("Including a non existant file returns a failure", () => {
    const fileName = "does-not-exist.test";
    const aFileStack = fileStack(defaultReaderMethod, "");
    const include = directiveFunction(
        irrelevantName, aFileStack.includeDirective
    );

    const result = include(fileName);
    assertFailures(result);
    const failures = extractedFailures(result);
    assertEquals(failures.length, 1);
    assertEquals(failures[0]!.kind, "file_notFound");
    assertEquals(
        (failures[0] as FileNotFoundFailure).message,
        `No such file or directory (os error 2): readfile '${fileName}'`
    );
});

Deno.test("Including an 'irrational' fileName returns a failure", () => {
    const aFileStack = fileStack(defaultReaderMethod, "");
    const include = directiveFunction(
        irrelevantName, aFileStack.includeDirective
    );

    const result = include([1, 2, 3]);
    assertFailures(result);
    assertFailureWithExtra(
        extractedFailures(result), "parameter_type", ["string", "0: array"]
    );
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
    const lines = files.lines().toArray();
    assertEquals(lines.length, 1);
    const line = lines[0]!;
    assertEquals(line.fileName, "does-not-exist.test");
    assertEquals(line.lineNumber, 0);
    assertEquals(line.rawSource, "");
    assert(line.failed());
    const failures = line.failures().toArray();
    assertEquals(failures.length, 1);
    assertEquals(failures[0]!.kind, "file_notFound");
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

    const aFileStack = fileStack(mockReader, "top.file");
    const include = directiveFunction(
        irrelevantName, aFileStack.includeDirective
    );
    const lines = aFileStack.lines();

    assertEquals("top.file 1", lines.next().value!.rawSource);
    assertSuccess(include("plop.txt"));
    assertEquals([
        "plop.txt 1", "plop.txt 2", "plop.txt 3",
        "top.file 2", "top.file 3",
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
