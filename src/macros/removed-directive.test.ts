import { expect } from "jsr:@std/expect";
import { emptyLine } from "../line/line-types.ts";
import { removedDirective } from "./removed-directive.ts";

Deno.test("If the original line was blank - it returns the original line", () => {
    const line = emptyLine("plop.asm");
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
        const line = emptyLine("plop.asm");
        line.rawSource = rawSource;
        const result = removedDirective("plop", line);
        expect(result).toBe(undefined);
    });
});

Deno.test("If the result is not blank - it returns a new line", () => {
    const line = emptyLine("plop.asm");
    line.rawSource = 'LDI R16, {{ macro("plop", "a", "b", "c" ""); }}';
    const result = removedDirective("plop", line);
    expect(result).not.toBe(line);
    expect(result!.rawSource).toBe("LDI R16,");
});
