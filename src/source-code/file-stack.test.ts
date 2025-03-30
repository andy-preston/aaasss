import { expect } from "jsr:@std/expect";
import { directiveFunction } from "../directives/directive-function.ts";
import type { Failure, ClueFailure, TypeFailure } from "../failure/bags.ts";
import type { FileName } from "./data-types.ts";
import { defaultReaderMethod, fileStack, type FileLineIterator } from "./file-stack.ts";

const irrelevantName = "testing";

Deno.test("Including a file doesn't return anything", () => {
    const irrelevantButRealFile = "deno.json";
    const aFileStack = fileStack(defaultReaderMethod, "");
    const include = directiveFunction(
        irrelevantName, aFileStack.includeDirective
    );

    const result = include(irrelevantButRealFile);
    expect(result.type).not.toBe("failure");
});

Deno.test("Including a non existant file returns a failure", () => {
    const fileName = "does-not-exist.test";
    const aFileStack = fileStack(defaultReaderMethod, "");
    const include = directiveFunction(
        irrelevantName, aFileStack.includeDirective
    );

    const result = include(fileName);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as ClueFailure;
    expect(failure.kind).toBe("file_notFound");
    expect(failure.clue).toBe(
        `No such file or directory (os error 2): readfile '${fileName}'`
    );
});

Deno.test("Including an 'irrational' fileName returns a failure", () => {
    const aFileStack = fileStack(defaultReaderMethod, "");
    const include = directiveFunction(
        irrelevantName, aFileStack.includeDirective
    );

    const result = include([1, 2, 3]);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as TypeFailure;
    expect(failure.kind).toBe("type_failure");
    expect(failure.location).toEqual({"parameter": 0});
    expect(failure.expected).toBe("string");
    expect(failure.actual).toBe("array");
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
        expect(line.fileName).toBe("mock.test");
        expect(line.lineNumber).toBe(index + 1);
        expect(line.rawSource).toBe(expectedLines[index]);
        expect(line.failed()).toBeFalsy();
        index = index + 1;
    }
});

Deno.test("Reading a non existant source file gives one line with a failure", () => {
    const files = fileStack(defaultReaderMethod, "does-not-exist.test");
    const lines = files.lines().toArray();
    expect(lines.length).toBe(1);
    const line = lines[0]!;
    expect(line.fileName).toBe("does-not-exist.test");
    expect(line.lineNumber).toBe(0);
    expect(line.rawSource).toBe("");
    expect(line.failed()).toBeTruthy();
    const failures = line.failures().toArray();
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("file_notFound");
});

Deno.test("The last line of the top source file is flagged as such", () => {
    const expectedLines = ["not last", "not last", "not last", "last"];
    const files = fileStack(
        (_path: FileName) => expectedLines,
        "mock.test"
    );
    for (const line of files.lines()) {
        expect(line.lastLine).toBe(line.rawSource == "last");
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

    expect(lines.next().value!.rawSource).toBe("top.file 1");

    const result = include("plop.txt");
    expect(result.type).not.toBe("failure");
    expect(lines.toArray().map(line => line.rawSource)).toEqual([
        "plop.txt 1", "plop.txt 2", "plop.txt 3",
        "top.file 2", "top.file 3",
    ]);
});

Deno.test("Imaginary files (e.g. macros) can be included", () => {
    const mockReader = (path: FileName) =>
        [1, 2, 3].map(line => `${path} ${line}`);

    const files = fileStack(mockReader, "top.file");
    const lines = files.lines();

    const firstLine = lines.next().value!;
    expect(firstLine.lineNumber).toBe(1);
    expect(firstLine.rawSource).toBe("top.file 1");

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
        expect(line.fileName).toBe("top.file");
        expect(line.lineNumber).toBe(expected[index]![0]);
        expect(line.rawSource).toBe(expected[index]![1]);
    }
});
