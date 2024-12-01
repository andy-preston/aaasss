import { assert, assertEquals, assertFalse } from "assert";
import { rawLine } from "../coupling/line.ts";
import { cpuRegisters } from "../device/registers.ts";
import { anEmptyContext } from "../testing.ts";
import { javascript } from "./javascript.ts";

Deno.test("JS can be delimited with moustaches on the same line", () => {
    const js = javascript(anEmptyContext());
    const line = rawLine(
        "", 0, "MOV {{ this.test = 27; return this.test; }}, R2", []
    );
    const assemblyLine = js.assembly(line);
    assertEquals(assemblyLine.assemblySource, "MOV 27, R2");
});

Deno.test("JS can use registers from the context", () => {
    const context = anEmptyContext();
    const registers = cpuRegisters(context);
    registers.choose(false);
    const js = javascript(context);
    const line = rawLine("", 0, "MOV {{ R6 }}, R2", []);
    const assemblyLine = js.assembly(line);
    assertEquals(assemblyLine.assemblySource, "MOV 6, R2");
});

Deno.test("JS can be delimited by moustaches across several lines", () => {
    const js = javascript(anEmptyContext());
    const lines = [
        rawLine("", 0, "some ordinary stuff {{ this.test = 27;", []),
        rawLine("", 0, 'this.andThat = "hello";', []),
        rawLine("", 0, "return this.andThat; }} matey!", []),
    ];
    const assemblyLines = lines.map(js.assembly);
    assertEquals(assemblyLines[0]!.assemblySource, "some ordinary stuff");
    assertEquals(assemblyLines[1]!.assemblySource, "");
    assertEquals(assemblyLines[2]!.assemblySource, "hello matey!");
});

Deno.test("Multiple opening moustaches are illegal", () => {
    const js = javascript(anEmptyContext());
    const assemblyLine = js.assembly(rawLine("", 0, "{{ {{ }}", []));
    assert(assemblyLine.failed());
    assertEquals(assemblyLine.failures.length, 1);
    assertEquals(assemblyLine.failures[0]!.kind, "js.jsMode");
});

Deno.test("Multiple closing moustaches are illegal", () => {
    const js = javascript(anEmptyContext());
    const assemblyLine = js.assembly(rawLine("", 0, "{{ }} }}", []));
    assert(assemblyLine.failed());
    assertEquals(assemblyLine.failures.length, 1);
    assertEquals(assemblyLine.failures[0]!.kind, "js.assemblerMode");
});

Deno.test("Omitting a closing moustache is illegal", () => {
    const js = javascript(anEmptyContext());
    const assemblyLine = js.assembly(rawLine("", 0, "{{", []));
    assertFalse(assemblyLine.failed());
    assertEquals(assemblyLine.failures.length, 0);
    const illegal = js.illegalState();
    assertEquals(illegal.length, 1);
    assertEquals(illegal[0]!.kind, "js.jsMode");
});
