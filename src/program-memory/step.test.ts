import { assertEquals } from "assert";
import { anEmptyContext } from "../context/context.ts";
import { deviceProperties } from "../device/properties.ts";
import { lineWithProcessedMacro } from "../macro/line-types.ts";
import { lineWithObjectCode } from "../object-code/line-types.ts";
import { Code } from "../object-code/data-types.ts";
import {
    lineWithRenderedJavascript, lineWithRawSource
} from "../source-code/line-types.ts";
import { lineWithTokens } from "../tokenise/line-types.ts";
import { lineWithAddress, lineWithPokedBytes } from "./line-types.ts";
import { programMemory } from "./program-memory.ts";

const testEnvironment = () => {
    const context = anEmptyContext();
    const properties = deviceProperties(context);
    return {
        "properties": properties,
        "memory": programMemory(context, properties.public)
    };
};

const testLine = (pokes: Array<Code>, code: Code) => {
    const raw = lineWithRawSource("", 0, false, "", []);
    const rendered = lineWithRenderedJavascript(raw, "", []);
    const tokenised = lineWithTokens(rendered, "", "", [], []);
    const processed = lineWithProcessedMacro(tokenised, "", []);
    const addressed = lineWithAddress(processed, 0, []);
    const poked = lineWithPokedBytes(addressed, pokes, []);
    return lineWithObjectCode(poked, [], code, []);
};

Deno.test("If a line has no code the address remains unchanged", () => {
    const environment = testEnvironment();
    environment.properties.setName("test");
    environment.properties.programMemoryBytes(100);
    assertEquals(0, environment.memory.address());
    environment.memory.step(testLine([], []));
    assertEquals(0, environment.memory.address());
});

Deno.test("The program counter advances by the number of words poked", () => {
    const environment = testEnvironment();
    environment.properties.setName("test");
    environment.properties.programMemoryBytes(100);
    assertEquals(0, environment.memory.address());
    environment.memory.step(testLine([[1, 2, 3, 4], [5, 6]], []));
    assertEquals(3, environment.memory.address());
});

Deno.test("... or by the number of words of code", () => {
    const environment = testEnvironment();
    environment.properties.setName("test");
    environment.properties.programMemoryBytes(100);
    assertEquals(0, environment.memory.address());
    environment.memory.step(testLine([], [1, 2]));
    assertEquals(1, environment.memory.address());
});

Deno.test("... or both", () => {
    const environment = testEnvironment();
    environment.properties.setName("test");
    environment.properties.programMemoryBytes(100);
    assertEquals(0, environment.memory.address());
    environment.memory.step(testLine([[1, 2, 3, 4], [5, 6]], [1, 2]));
    assertEquals(4, environment.memory.address());
});
