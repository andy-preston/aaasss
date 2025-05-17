import type { SourceCode } from "../source-code/data-types.ts";

import { expect } from "jsr:@std/expect";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { assemblyPipeline } from "./embedded.ts";
import { jSExpression } from "./expression.ts";
import { currentLine } from "../line/current-line.ts";

const systemUnderTest = (...sourceLines: Array<SourceCode>) => {
    const testLines = function* () {
        for (const sourceCode of sourceLines) {
            yield lineWithRawSource("", 0, sourceCode, "", 0, false);
        }
        yield lineWithRawSource("", 0, "", "", 0, true);
    };

    const $currentLine = currentLine();
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $jsExpression = jSExpression($symbolTable);
    const $assemblyPipeline = assemblyPipeline($jsExpression, $currentLine);
    return {
        "assemblyPipeline": $assemblyPipeline(testLines())
    };
};

Deno.test("A symbol assignment does not pollute the `this` context object", () => {
    const system = systemUnderTest(
        "{{ plop = 27; this.plop; }}"
    );
    const result = system.assemblyPipeline.next().value!;
    expect(result.failed()).toBeFalsy();
    expect(result.assemblySource).not.toBe("27");
    expect(result.assemblySource).toBe("");
});

Deno.test("JS can be delimited with moustaches on the same line", () => {
    const system = systemUnderTest(
        "MOV {{ const test = 27; test; }}, R2"
    );
    const result = system.assemblyPipeline.next().value!;
    expect(result.failed()).toBeFalsy();
    expect(result.assemblySource).toBe("MOV 27, R2");
});

Deno.test("JS can be delimited by moustaches across several lines", () => {
    const system = systemUnderTest(
        "some ordinary stuff {{ const test = 27;",
        'const message = "hello";',
        "message; }} matey!",
    );
    const result = [...system.assemblyPipeline];
    expect(result[0]!.failed()).toBeFalsy();
    expect(result[0]!.assemblySource).toBe("some ordinary stuff");
    expect(result[1]!.failed()).toBeFalsy();
    expect(result[1]!.assemblySource).toBe("");
    expect(result[2]!.failed()).toBeFalsy();
    expect(result[2]!.assemblySource).toBe("hello matey!");
});

Deno.test("Multiple opening moustaches are illegal", () => {
    const system = systemUnderTest(
        "{{ {{ }}"
    );
    const result = system.assemblyPipeline.next().value!;
    expect(result.failed()).toBeTruthy();
    const failures = [...result.failures()];
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("js_jsMode");
});

Deno.test("Multiple closing moustaches are illegal", () => {
    const system = systemUnderTest(
        "{{ }} }}"
    );
    const result = system.assemblyPipeline.next().value!;
    expect(result.failed()).toBeTruthy();
    const failures = [...result.failures()];
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("js_assemblerMode");
});

Deno.test("Omitting a closing moustache is illegal", () => {
    const system = systemUnderTest(
        "{{"
    );
    const result = system.assemblyPipeline.next().value!;
    expect(result.failed()).toBeFalsy();
    expect(result.failures.length).toBe(0);

    const lastLine = system.assemblyPipeline.next().value!;
    expect(lastLine.failed()).toBeTruthy();
    const failures = [...lastLine.failures()];
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("js_jsMode");
});
