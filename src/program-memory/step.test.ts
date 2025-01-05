import { assert, assertEquals, assertFalse } from "assert";
import { deviceProperties } from "../device/properties.ts";
import { assertFailure } from "../failure/testing.ts";
import { anEmptyContext } from "../javascript/context.ts";
import { lineWithRenderedJavascript } from "../javascript/embedded/line-types.ts";
import { lineWithProcessedMacro } from "../macro/line-types.ts";
import { lineWithObjectCode, lineWithPokedBytes } from "../object-code/line-types.ts";
import type { Code } from "../object-code/data-types.ts";
import { lineWithOperands } from "../operands/line-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
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
    const raw = lineWithRawSource("", 0, false, "");
    const rendered = lineWithRenderedJavascript(raw, "");
    const tokenised = lineWithTokens(rendered, "", "", []);
    const processed = lineWithProcessedMacro(tokenised, "");
    const withOperands = lineWithOperands(processed, [], []);
    const poked = lineWithPokedBytes(withOperands, pokes);
    return lineWithObjectCode(poked, code);
};

Deno.test("If a line has no code the address remains unchanged", () => {
    const environment = testEnvironment();
    environment.properties.setName("test");
    environment.properties.programMemoryBytes(100);
    assertEquals(0, environment.memory.address());
    environment.memory.pipeline(testLine([], []));
    assertEquals(0, environment.memory.address());
});

Deno.test("The program counter advances by the number of words poked", () => {
    const environment = testEnvironment();
    environment.properties.setName("test");
    environment.properties.programMemoryBytes(100);
    assertEquals(0, environment.memory.address());
    environment.memory.pipeline(testLine([[1, 2, 3, 4], [5, 6]], []));
    assertEquals(3, environment.memory.address());
});

Deno.test("... or by the number of words of code", () => {
    const environment = testEnvironment();
    environment.properties.setName("test");
    environment.properties.programMemoryBytes(100);
    assertEquals(0, environment.memory.address());
    environment.memory.pipeline(testLine([], [1, 2]));
    assertEquals(1, environment.memory.address());
});

Deno.test("... or both", () => {
    const environment = testEnvironment();
    environment.properties.setName("test");
    environment.properties.programMemoryBytes(100);
    assertEquals(0, environment.memory.address());
    environment.memory.pipeline(testLine([[1, 2, 3, 4], [5, 6]], [1, 2]));
    assertEquals(4, environment.memory.address());
});

Deno.test("Insufficient program memory causes generation to fail", () => {
    const environment = testEnvironment();
    environment.properties.setName("testDevice");
    environment.properties.programMemoryBytes(0);
    const line = testLine([[1, 2, 3, 4]], [1, 2]);
    const result = environment.memory.pipeline(line);
    assert(result.failed(), "Didn't fail!");
    result.failures().forEach((failure, index) => {
        assertEquals(index, 0);
        assertFailure(failure, "programMemory_outOfRange");
    });
    // But, look, code is still generated
    assertEquals(result.code, [[1, 2, 3, 4], [1, 2]]);
    //assertEquals(environment.programMemory.address(), 1);
});

Deno.test("Advancing beyond the end of program memory causes failure", () => {
    const environment = testEnvironment();
    environment.properties.setName("testDevice");
    environment.properties.programMemoryBytes(6);

    const firstLine = testLine([[1, 2, 3, 4]], [1, 2]);
    const firstResult = environment.memory.pipeline(firstLine);
    assertFalse(firstResult.failed(), "Unexpected failure");
    assertEquals(firstResult.failures.length, 0);
    assertEquals(firstResult.code, [[1, 2, 3, 4], [1, 2]]);
    //assertEquals(environment.programMemory.address(), 1);

    const secondLine = testLine([[1, 2, 3, 4]], [1, 2]);
    const secondResult = environment.memory.pipeline(secondLine);
    assert(secondResult.failed(), "Didn't fail!");
    secondResult.failures().forEach((failure, index) => {
        assertEquals(index, 0);
        assertFailure(failure, "programMemory_outOfRange");
    });
    // But, look, code is still generated
    assertEquals(firstResult.code, [[1, 2, 3, 4], [1, 2]]);
    //assertEquals(environment.programMemory.address(), 2);
});
