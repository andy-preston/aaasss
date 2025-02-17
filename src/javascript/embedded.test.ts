import { assert, assertEquals, assertFalse, assertNotEquals } from "assert";
import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { directiveList } from "../directives/directive-list.ts";
import { assertFailure } from "../failure/testing.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { SourceCode } from "../source-code/data-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { embeddedJs } from "./embedded.ts";
import { jSExpression } from "./expression.ts";

const testLine = (source: SourceCode) =>
    lineWithRawSource("", 0, source, "", 0, false);

const testEnvironment = () => {
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
    const environment = testEnvironment();
    const rendered = environment.js.rendered(testLine(
        "{{ plop = 27; this.plop; }}"
    ));
    assertNotEquals(rendered.assemblySource, "27");
    assertEquals(rendered.assemblySource, "0");
});

Deno.test("A symbol will not be reassigned using `this.symbol`", () => {
    const environment = testEnvironment();
    environment.symbolTable.defineDirective("plop", 57);
    // The assignment fails silently.
    // I'm not sure if this is a good thing or a bad thing?
    // But let's treat it that assigning to this.something
    // is just not in the specification.
    const rendered = environment.js.rendered(testLine(
        "{{ this.plop = 27; this.plop; }}"
    ));
    assertNotEquals(rendered.assemblySource, "27");
    assertEquals(rendered.assemblySource, "57");
});

Deno.test("JS can be delimited with moustaches on the same line", () => {
    const environment = testEnvironment();
    const rendered = environment.js.rendered(testLine(
        "MOV {{ const test = 27; test; }}, R2"
    ));
    assertEquals(rendered.assemblySource, "MOV 27, R2");
});

Deno.test("JS can use registers as symbols", () => {
    const environment = testEnvironment();
    environment.cpuRegisters.initialise(false);
    assertEquals(environment.symbolTable.use("R6"), 6);
    const rendered = environment.js.rendered(testLine("MOV {{ R6 }}, R2"));
    assertEquals(rendered.assemblySource, "MOV 6, R2");
});

Deno.test("JS can be delimited by moustaches across several lines", () => {
    const environment = testEnvironment();
    const lines = [
        testLine("some ordinary stuff {{ const test = 27;"),
        testLine('const message = "hello";'),
        testLine("message; }} matey!"),
    ];
    const rendered = lines.map(environment.js.rendered);
    assertEquals(rendered[0]!.assemblySource, "some ordinary stuff");
    assertEquals(rendered[1]!.assemblySource, "");
    assertEquals(rendered[2]!.assemblySource, "hello matey!");
});

Deno.test("Multiple opening moustaches are illegal", () => {
    const environment = testEnvironment();
    const rendered = environment.js.rendered(testLine("{{ {{ }}"));
    assert(rendered.failed());
    rendered.failures().forEach((failure, index) => {
        assertEquals(index, 0);
        assertFailure(failure, "js_jsMode");
    });
});

Deno.test("Multiple closing moustaches are illegal", () => {
    const environment = testEnvironment();
    const rendered = environment.js.rendered(testLine("{{ }} }}"));
    assert(rendered.failed());
    rendered.failures().forEach((failure, index) => {
        assertEquals(index, 0);
        assertFailure(failure, "js_assemblerMode");
    });
});

Deno.test("Omitting a closing moustache is illegal", () => {
    const environment = testEnvironment();
    const rendered = environment.js.rendered(testLine("{{"));
    assertFalse(rendered.failed());
    assertEquals(rendered.failures.length, 0);
    const illegal = environment.js.leftInIllegalState();
    assertFailure(illegal, "js_jsMode");
});
