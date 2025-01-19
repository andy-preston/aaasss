import { assert, assertEquals, assertFalse, assertNotEquals } from "assert";
import { cpuRegisters } from "../../device/registers.ts";
import { assertFailure } from "../../failure/testing.ts";
import { SourceCode } from "../../source-code/data-types.ts";
import { lineWithRawSource } from "../../source-code/line-types.ts";
import { anEmptyContext } from "../context.ts";
import { javascript } from "./embedded.ts";

const testLine = (source: SourceCode) =>
    lineWithRawSource("", 0, false, source);

const testEnvironment = () => {
    const context = anEmptyContext();
    const registers = cpuRegisters(context);
    return {
        "context": context,
        "registers": registers,
        "js": javascript(context)
    };
};

Deno.test("A property will not be reassigned", () => {
    const environment = testEnvironment();
    environment.context.property("plop", 57);
    // The assignment fails silently.
    // I'm not sure if this is a good thing or a bad thing?
    // But let's treat it that assigning to this.something
    // is just not in the specification.
    const rendered = environment.js.rendered(testLine(
        "{{ this.plop = 27; return this.plop; }}"
    ));
    assertNotEquals(rendered.assemblySource, "27");
    assertEquals(rendered.assemblySource, "57");
});

Deno.test("JS can be delimited with moustaches on the same line", () => {
    const environment = testEnvironment();
    const rendered = environment.js.rendered(testLine(
        "MOV {{ this.test = 27; return this.test; }}, R2"
    ));
    assertEquals(rendered.assemblySource, "MOV 27, R2");
});

Deno.test("JS can use registers from the context", () => {
    const environment = testEnvironment();
    environment.registers.choose(false);
    const rendered = environment.js.rendered(testLine("MOV {{ R6 }}, R2"));
    assertEquals(rendered.assemblySource, "MOV 6, R2");
});

Deno.test("JS can be delimited by moustaches across several lines", () => {
    const environment = testEnvironment();
    const lines = [
        testLine("some ordinary stuff {{ this.test = 27;"),
        testLine('this.andThat = "hello";'),
        testLine("return this.andThat; }} matey!"),
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
