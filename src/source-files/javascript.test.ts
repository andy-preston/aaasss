import { assertEquals } from "assert";
import { cpuRegisters } from "../device/registers.ts";
import { anEmptyContext } from "../testing.ts";
import { javascript } from "./javascript.ts";
import { rawLine } from "./line.ts";

Deno.test("JS can be delimited with moustaches on the same line", () => {
    const js = javascript(anEmptyContext());
    const line = rawLine(
        "", 0, "MOV {{ this.test = 27; return this.test; }}, R2"
    );
    const assemblyLine = js(line);
    assertEquals(assemblyLine.assemblySource, "MOV 27, R2");
});

Deno.test("JS can use registers from the context", () => {
    const context = anEmptyContext();
    const registers = cpuRegisters(context);
    registers.choose(false);
    const js = javascript(context);
    const line = rawLine("", 0, "MOV {{ R6 }}, R2");
    const result = js(line);
    assertEquals(result.assemblySource, "MOV 6, R2");
});

Deno.test("JS can be delimited by moustaches across several lines", () => {
    const js = javascript(anEmptyContext());
    const lines = [
        rawLine("", 0, "some ordinary stuff {{ this.test = 27;"),
        rawLine("", 0, "this.andThat = \"hello\";"),
        rawLine("", 0, "return this.andThat; }} matey!")
    ];
    const results = lines.map(js);
    assertEquals(results[0]!.assemblySource, "some ordinary stuff");
    assertEquals(results[1]!.assemblySource, "");
    assertEquals(results[2]!.assemblySource, "hello matey!");
});
