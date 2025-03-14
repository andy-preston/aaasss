import { assert, assertEquals, assertFalse, assertNotEquals } from "assert";
import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { directiveList } from "../directives/directive-list.ts";
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
    const symbols = symbolTable(
        directiveList(), deviceProperties().public, registers, pass()
    );
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
    assertFalse(rendered.failed());
    assertNotEquals(rendered.assemblySource, "27");
    assertEquals(rendered.assemblySource, "");
});

Deno.test("JS can be delimited with moustaches on the same line", () => {
    const system = systemUnderTest();
    const rendered = system.js.rendered(testLine(
        "MOV {{ const test = 27; test; }}, R2"
    ));
    assertFalse(rendered.failed());
    assertEquals(rendered.assemblySource, "MOV 27, R2");
});

Deno.test("JS can be delimited by moustaches across several lines", () => {
    const system = systemUnderTest();
    const lines = [
        testLine("some ordinary stuff {{ const test = 27;"),
        testLine('const message = "hello";'),
        testLine("message; }} matey!"),
    ];
    const rendered = lines.map(system.js.rendered);
    assertFalse(rendered[0]!.failed());
    assertEquals(rendered[0]!.assemblySource, "some ordinary stuff");
    assertFalse(rendered[1]!.failed());
    assertEquals(rendered[1]!.assemblySource, "");
    assertFalse(rendered[2]!.failed());
    assertEquals(rendered[2]!.assemblySource, "hello matey!");
});

Deno.test("Multiple opening moustaches are illegal", () => {
    const system = systemUnderTest();
    const rendered = system.js.rendered(testLine("{{ {{ }}"));
    assert(rendered.failed());
    const failures = rendered.failures().toArray();
    assertEquals(failures.length, 1);
    assertEquals(failures[0]!.kind, "js_jsMode");
});

Deno.test("Multiple closing moustaches are illegal", () => {
    const system = systemUnderTest();
    const rendered = system.js.rendered(testLine("{{ }} }}"));
    assert(rendered.failed());
    const failures = rendered.failures().toArray();
    assertEquals(failures.length, 1);
    assertEquals(failures[0]!.kind, "js_assemblerMode");
});

Deno.test("Omitting a closing moustache is illegal", () => {
    const system = systemUnderTest();
    const rendered = system.js.rendered(testLine("{{"));
    assertFalse(rendered.failed());
    assertEquals(rendered.failures.length, 0);
    const result = system.js.leftInIllegalState();
    assertEquals(result.type, "failures");
    const failures = result.it as Array<Failure>;
    assertEquals(failures.length, 1);
    assertEquals(failures[0]!.kind, "js_jsMode");
});
