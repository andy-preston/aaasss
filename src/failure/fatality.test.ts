import { assert, assertEquals, assertFalse } from "assert";
import { line } from "../assembler/line.ts";
import { failure } from "./failure-or-box.ts";
import type { LineWithFailures } from "./line-types.ts";

const testLine = () => line("", 0, false, "") as LineWithFailures;

Deno.test("A line with a fatal failure has 'failed'", () => {
    const line = testLine();
    assertFalse(line.failed());
    line.withFailure(failure(undefined, "file_notFound", undefined));
    assert(line.failed());
});

Deno.test("A line with a warning has not 'failed'", () => {
    const line = testLine();
    assertFalse(line.failed());
    line.withFailure(failure(undefined, "symbol_notUsed", undefined));
    assertFalse(line.failed());
});

Deno.test("Warnings still get listed as failures though", () => {
    const line = testLine();
    line.withFailure(failure(undefined, "file_notFound", undefined));
    line.withFailure(failure(undefined, "device_notFound", undefined));
    line.withFailure(failure(undefined, "symbol_notUsed", undefined));
    assertEquals(3, line.failures().toArray().length);
});
