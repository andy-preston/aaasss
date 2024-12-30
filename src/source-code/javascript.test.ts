import { assert, assertEquals, assertFalse } from "assert";
import { anEmptyContext } from "../context/context.ts";
import { cpuRegisters } from "../device/registers.ts";
import { javascript } from "./javascript.ts";
import { lineWithRawSource } from "./line-types.ts";

Deno.test("JS can be delimited with moustaches on the same line", () => {
    const js = javascript(anEmptyContext());
    const line = lineWithRawSource(
        "", 0, "MOV {{ this.test = 27; return this.test; }}, R2", []
    );
    const rendered = js.rendered(line);
    assertEquals(rendered.assemblySource, "MOV 27, R2");
});

Deno.test("JS can use registers from the context", () => {
    const context = anEmptyContext();
    const registers = cpuRegisters(context);
    registers.choose(false);
    const js = javascript(context);
    const line = lineWithRawSource("", 0, "MOV {{ R6 }}, R2", []);
    const rendered = js.rendered(line);
    assertEquals(rendered.assemblySource, "MOV 6, R2");
});

Deno.test("JS can be delimited by moustaches across several lines", () => {
    const js = javascript(anEmptyContext());
    const lines = [
        lineWithRawSource("", 0, "some ordinary stuff {{ this.test = 27;", []),
        lineWithRawSource("", 0, 'this.andThat = "hello";', []),
        lineWithRawSource("", 0, "return this.andThat; }} matey!", []),
    ];
    const rendered = lines.map(js.rendered);
    assertEquals(rendered[0]!.assemblySource, "some ordinary stuff");
    assertEquals(rendered[1]!.assemblySource, "");
    assertEquals(rendered[2]!.assemblySource, "hello matey!");
});

Deno.test("Multiple opening moustaches are illegal", () => {
    const js = javascript(anEmptyContext());
    const rendered = js.rendered(lineWithRawSource("", 0, "{{ {{ }}", []));
    assert(rendered.failed());
    assertEquals(rendered.failures.length, 1);
    assertEquals(rendered.failures[0]!.kind, "js_jsMode");
});

Deno.test("Multiple closing moustaches are illegal", () => {
    const js = javascript(anEmptyContext());
    const rendered = js.rendered(lineWithRawSource("", 0, "{{ }} }}", []));
    assert(rendered.failed());
    assertEquals(rendered.failures.length, 1);
    assertEquals(rendered.failures[0]!.kind, "js_assemblerMode");
});

Deno.test("Omitting a closing moustache is illegal", () => {
    const js = javascript(anEmptyContext());
    const rendered = js.rendered(lineWithRawSource("", 0, "{{", []));
    assertFalse(rendered.failed());
    assertEquals(rendered.failures.length, 0);
    const illegal = js.leftInIllegalState();
    assertEquals(illegal.length, 1);
    assertEquals(illegal[0]!.kind, "js_jsMode");
});
