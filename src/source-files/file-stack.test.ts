import { assert, assertFalse, assertEquals } from "assert";
import { fileStack } from "./file-stack.ts";
import { assertFailure, assertSuccess } from "../testing.ts";

Deno.test("Including a file returns a blank value", () => {
    assertSuccess(
        // This file is irrelevant but we can guarantee it exists
        fileStack(Deno.readTextFileSync).includeFile("deno.json"),
        ""
    );
});

Deno.test("Including a non existant file returns a failure", () => {
    assertFailure(
        fileStack(Deno.readTextFileSync).includeFile("does-not-exist.test"),
        "file.notFound"
    );
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
