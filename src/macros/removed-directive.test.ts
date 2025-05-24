import type { SourceCode } from "../source-code/data-types.ts";

import { expect } from "jsr:@std/expect";
import { dummyLine, line } from "../line/line-types.ts";
import { removedDirective } from "./removed-directive.ts";

Deno.test("If the original line was blank - it returns the original line", () => {
    const line = dummyLine(false);
    const result = removedDirective("plop", line);
    expect(result).toBe(line);
});

Deno.test("If the result is now blank - it returns undefined", () => {
    const styles = [
        '{{ macro("plop", "a", "b", "c" ""); }}',
        '{{ macro ("plop", "a", "b", "c" "") }}',
        '{{ macro ( "plop", "a", "b", "c" "" ); }}'
    ];
    styles.forEach(rawSource => {
        const line = dummyLine(false);
        line.rawSource = rawSource;
        const result = removedDirective("plop", line);
        expect(result).toBe(undefined);
    });
});

Deno.test("If the result is not blank - it returns a new line", () => {
    const line = dummyLine(false);
    line.rawSource = 'LDI R16, {{ macro("plop", "a", "b", "c" ""); }}';
    const result = removedDirective("plop", line);
    expect(result).not.toBe(line);
    expect(result!.rawSource).toBe("LDI R16,");
});
