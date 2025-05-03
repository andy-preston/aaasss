import type { AssertionFailure, Failure, ClueFailure } from "../failure/bags.ts";
import type { FileLineIterator, FileName } from "./data-types.ts";

import { expect } from "jsr:@std/expect";
import { directiveFunction } from "../directives/directive-function.ts";
import { defaultReaderMethod, fileStack } from "./file-stack.ts";

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
    const failure = failures[0] as AssertionFailure;
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
    files.assemblyPipeline(1).filter(line => !line.lastLine).forEach(line => {
        expect(line.fileName).toBe("mock.test");
        expect(line.lineNumber).toBe(index + 1);
        expect(line.rawSource).toBe(expectedLines[index]);
        expect(line.failed()).toBeFalsy();
        index = index + 1;
    });
});

Deno.test("Reading a non existant source file gives one line with a failure", () => {
    const files = fileStack(defaultReaderMethod, "does-not-exist.test");
    const lines = [...files.assemblyPipeline(1)];
    expect(lines.length).toBe(1);
    const line = lines[0]!;
    expect(line.fileName).toBe("does-not-exist.test");
    expect(line.lineNumber).toBe(0);
    expect(line.rawSource).toBe("");
    expect(line.failed()).toBeTruthy();
    const failures = [...line.failures()];
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("file_notFound");
});

Deno.test("A mock last line is added to the end of the top file", () => {
    const testLines = ["Real Line", "Real Line", "Real Line", "Real Line"];
    const files = fileStack(
        (_path: FileName) => testLines,
        "mock.test"
    );
    const lines = [...files.assemblyPipeline(1)];
    expect(lines.length).toBe(testLines.length + 1);
    files.assemblyPipeline(1).forEach(line => {
        expect(line.lastLine).toBe(line.rawSource != "Real Line");
    });
});

Deno.test("An included file is inserted into the source stream", () => {
    const mockReader = (path: FileName) =>
        [1, 2, 3].map(line => `${path} ${line}`);
    const dummyLastLine = "";

    const aFileStack = fileStack(mockReader, "top.file");
    const include = directiveFunction(
        irrelevantName, aFileStack.includeDirective
    );
    const assemblyPipeline = aFileStack.assemblyPipeline(1);

    expect(assemblyPipeline.next().value!.rawSource).toBe("top.file 1");

    const result = include("plop.txt");
    expect(result.type).not.toBe("failure");
    expect([...assemblyPipeline].map(line => line.rawSource)).toEqual([
        "plop.txt 1", "plop.txt 2", "plop.txt 3",
        "top.file 2", "top.file 3", dummyLastLine
    ]);
});

Deno.test("Imaginary files (e.g. macros) can be included", () => {
    const mockReader = (path: FileName) =>
        [1, 2, 3].map(line => `${path} ${line}`);

    const files = fileStack(mockReader, "top.file");
    const assemblyPipeline = files.assemblyPipeline(1);

    const firstLine = assemblyPipeline.next().value!;
    expect(firstLine.lineNumber).toBe(1);
    expect(firstLine.rawSource).toBe("top.file 1");

    const imaginaryFile = function* (): FileLineIterator {
        yield ["one", "", 0];
        yield ["two", "", 0];
        yield ["three", "", 0];
    }
    files.pushImaginary(imaginaryFile());

    const expected = [
        [1, "one"       ], [1, "two"       ], [1, "three"],
        [2, "top.file 2"], [3, "top.file 3"], [0, ""     ]
    ];
    assemblyPipeline.forEach((line, index) => {
        expect(line.fileName).toBe("top.file");
        expect(line.lineNumber).toBe(expected[index]![0]);
        expect(line.rawSource).toBe(expected[index]![1]);
    });
});
