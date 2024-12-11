import { assert, assertFalse, assertEquals, assertInstanceOf } from "assert";
import {
    assertFailure, assertSuccess
} from "../coupling/value-failure-testing.ts";
import { fileStack } from "./file-stack.ts";
import { Failure } from "../coupling/value-failure.ts";

const peculiarErrorMessage = (fileName: string) => {
    const prefix = "No such file or directory (os error 2)";
    const suffix = `: readfile '${fileName}': `;
    return `${prefix}${suffix}${prefix}${suffix}${prefix}`;
};

Deno.test("Including a file returns a blank value", () => {
    assertSuccess(
        // This file is irrelevant but we can guarantee it exists
        fileStack(Deno.readTextFileSync).includeFile("deno.json"),
        ""
    );
});

Deno.test("Including a non existant file returns a failure", () => {
    const fileName = "does-not-exist.test";
    const result = fileStack(Deno.readTextFileSync).includeFile(fileName);
    assertFailure(result, "file.notFound");
    const failure = result as Failure;
    assertInstanceOf(failure.extra, Deno.errors.NotFound);
    assertEquals(failure.extra.message, peculiarErrorMessage(fileName));
});

Deno.test("Including an 'irrational' fileName returns a failure", () => {
    const result = fileStack(Deno.readTextFileSync).includeFile(
        [1, 2, 3] as unknown as string
    );
    assertFailure(result, "type.string");
    assertEquals((result as Failure).extra, "1,2,3");
});

Deno.test("Reading a file yields multiple lines with the file contents", () => {
    // cSpell:words plip wibble
    const expectedLines = ["plip", "plop", "wibble", "wobble"];
    const files = fileStack(
        (_path: string | URL): string => expectedLines.join("\n")
    );
    let lineNumber = 0;
    for (const line of files.lines("mock.test")) {
        assertEquals(line.fileName, "mock.test");
        assertEquals(line.lineNumber, lineNumber);
        assertEquals(line.rawSource, expectedLines[lineNumber]);
        assertFalse(line.failed());
        lineNumber = lineNumber + 1;
    }
});

Deno.test("Reading a non existant source file gives one line with a failure", () => {
    const files = fileStack(Deno.readTextFileSync);
    let lineCount = 0;
    for (const line of files.lines("does-not-exist.test")) {
        assertEquals(line.fileName, "does-not-exist.test");
        assertEquals(line.lineNumber, 0);
        assertEquals(line.rawSource, "");
        assert(line.failed());
        assertEquals(line.failures[0]!.kind, "file.notFound");
        lineCount = lineCount + 1;
    }
    assertEquals(lineCount, 1);
});
