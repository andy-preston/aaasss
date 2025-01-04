import { assert, assertEquals, assertFalse } from "assert";
import { anEmptyContext } from "../context/context.ts";
import { cpuRegisters } from "../device/registers.ts";
import { SourceCode } from "../source-code/data-types.ts";
import { javascript } from "./javascript.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";

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
    assertEquals(rendered.failures.length, 1);
    assertEquals(rendered.failures[0]!.kind, "js_jsMode");
});

Deno.test("Multiple closing moustaches are illegal", () => {
    const environment = testEnvironment();
    const rendered = environment.js.rendered(testLine("{{ }} }}"));
    assert(rendered.failed());
    assertEquals(rendered.failures.length, 1);
    assertEquals(rendered.failures[0]!.kind, "js_assemblerMode");
});

Deno.test("Omitting a closing moustache is illegal", () => {
    const environment = testEnvironment();
    const rendered = environment.js.rendered(testLine("{{"));
    assertFalse(rendered.failed());
    assertEquals(rendered.failures.length, 0);
    const illegal = environment.js.leftInIllegalState();
    assertEquals(illegal.length, 1);
    assertEquals(illegal[0]!.kind, "js_jsMode");
});
