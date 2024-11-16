import { assert, assertEquals } from "assert";
import { fileStack } from "./file-stack.ts";
import { assertFailure, assertSuccess } from "../testing.ts";

Deno.test("Including a file returns a blank value", () => {
    assertSuccess(
        // This file is irrelevant but we can guarantee it exists
        fileStack().includeFile("deno.json"),
        ""
    );
});

Deno.test("Including a non existant file returns a failure", () => {
    assertFailure(
        fileStack().includeFile("does-not-exist.test"),
        "file.notFound"
    );
});

Deno.test("Reading a non existant source file gives one line with a failure", () => {
    let lineCount = 0;
    for (const line of fileStack().lines("does-not-exist.test")) {
        assertEquals(line.fileName, "does-not-exist.test");
        assertEquals(line.lineNumber, 0);
        assertEquals(line.rawSource, "");
        assert(line.failed);
        assertEquals(line.failures.length, 1);
        assertEquals(line.failures[0]!.kind, "file.notFound");
        lineCount = lineCount + 1;
    }
    assertEquals(lineCount, 1);
});
