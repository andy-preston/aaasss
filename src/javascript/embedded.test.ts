import { expect } from "jsr:@std/expect";
import type { Failure } from "../failure/bags.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import type { SourceCode } from "../source-code/data-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { embeddedJs } from "./embedded.ts";
import { jSExpression } from "./expression.ts";

const testLine = (source: SourceCode) =>
    lineWithRawSource("", 0, source, "", 0, false);

const systemUnderTest = () => {
    const registers = cpuRegisters();
    const symbols = symbolTable(registers);
    return {
        "cpuRegisters": registers,
        "symbolTable": symbols,
        "js": embeddedJs(jSExpression(symbols))
    };
};

Deno.test("A symbol assignment does not pollute the `this` context object", () => {
    const system = systemUnderTest();
    const rendered = system.js.rendered(testLine(
        "{{ plop = 27; this.plop; }}"
    ));
    expect(rendered.failed()).toBeFalsy();
    expect(rendered.assemblySource).not.toBe("27");
    expect(rendered.assemblySource).toBe("");
});

Deno.test("JS can be delimited with moustaches on the same line", () => {
    const system = systemUnderTest();
    const rendered = system.js.rendered(testLine(
        "MOV {{ const test = 27; test; }}, R2"
    ));
    expect(rendered.failed()).toBeFalsy();
    expect(rendered.assemblySource).toBe("MOV 27, R2");
});

Deno.test("JS can be delimited by moustaches across several lines", () => {
    const system = systemUnderTest();
    const lines = [
        testLine("some ordinary stuff {{ const test = 27;"),
        testLine('const message = "hello";'),
        testLine("message; }} matey!"),
    ];
    const rendered = lines.map(system.js.rendered);
    expect(rendered[0]!.failed()).toBeFalsy();
    expect(rendered[0]!.assemblySource).toBe("some ordinary stuff");
    expect(rendered[1]!.failed()).toBeFalsy();
    expect(rendered[1]!.assemblySource).toBe("");
    expect(rendered[2]!.failed()).toBeFalsy();
    expect(rendered[2]!.assemblySource).toBe("hello matey!");
});

Deno.test("Multiple opening moustaches are illegal", () => {
    const system = systemUnderTest();
    const rendered = system.js.rendered(testLine("{{ {{ }}"));
    expect(rendered.failed()).toBeTruthy();
    const failures = rendered.failures().toArray();
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("js_jsMode");
});

Deno.test("Multiple closing moustaches are illegal", () => {
    const system = systemUnderTest();
    const rendered = system.js.rendered(testLine("{{ }} }}"));
    expect(rendered.failed()).toBeTruthy();
    const failures = rendered.failures().toArray();
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("js_assemblerMode");
});

Deno.test("Omitting a closing moustache is illegal", () => {
    const system = systemUnderTest();
    const rendered = system.js.rendered(testLine("{{"));
    expect(rendered.failed()).toBeFalsy();
    expect(rendered.failures.length).toBe(0);
    const result = system.js.leftInIllegalState();
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("js_jsMode");
});
