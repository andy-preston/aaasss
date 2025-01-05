import { assert, assertEquals, assertFalse } from "assert";
import { deviceProperties } from "../device/properties.ts";
import { assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { anEmptyContext } from "../javascript/context.ts";
import { lineWithRenderedJavascript } from "../javascript/embedded/line-types.ts";
import { lineWithProcessedMacro } from "../macro/line-types.ts";
import { lineWithObjectCode, lineWithPokedBytes } from "../object-code/line-types.ts";
import { lineWithOperands } from "../operands/line-types.ts";
import { passes } from "../pipeline/pass.ts";
import type { Label } from "../source-code/data-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { lineWithTokens } from "../tokens/line-types.ts";
import { programMemory } from "./program-memory.ts";

const testEnvironment = () => {
    const context = anEmptyContext();
    const properties = deviceProperties(context);
    return {
        "context": context,
        "properties": properties,
        "programMemory": programMemory(context, properties.public),
    };
};

const testLine = (label: Label) => {
    const raw = lineWithRawSource("", 0, false, "");
    const rendered = lineWithRenderedJavascript(raw, "");
    const tokenised = lineWithTokens(rendered, label, "", []);
    const processed = lineWithProcessedMacro(tokenised, "");
    const operands = lineWithOperands(processed, [], []);
    const poked = lineWithPokedBytes(operands, []);
    return lineWithObjectCode(poked, []);
};

Deno.test("A label is stored in the context with the current address", () => {
    const environment = testEnvironment();
    environment.properties.setName("testDevice");
    environment.properties.programMemoryBytes(1024);
    environment.programMemory.origin(10);

    const line = testLine("A_LABEL");
    const result = environment.programMemory.pipeline(line);
    assertFalse(result.failed(), "Unexpected failure");
    assertEquals(result.failures.length, 0);

    const labelValue = environment.context.value("A_LABEL");
    assertSuccess(labelValue, "10");
});

Deno.test("Labels can be defined on multiple passes but must keep the same address", () => {
    const environment = testEnvironment();
    environment.properties.setName("testDevice");
    environment.properties.programMemoryBytes(1024);
    environment.programMemory.origin(10);
    for (const _pass of passes) {
        const line = testLine("A_LABEL");
        const result = environment.programMemory.pipeline(line);
        assertFalse(result.failed(), "Unexpected failure");
        assertEquals(result.failures.length, 0);

        const labelValue = environment.context.value("A_LABEL");
        assertSuccess(labelValue, "10");
    }
});

Deno.test("... but will cause a failure if the address changes", () => {
    const environment = testEnvironment();
    environment.properties.setName("testDevice");
    environment.properties.programMemoryBytes(1024);

    environment.programMemory.origin(10);
    const firstLine = testLine("A_LABEL");
    const firstResult = environment.programMemory.pipeline(firstLine);
    assertFalse(firstResult.failed(), "Unexpected failure");
    assertEquals(firstResult.failures.length, 0);

    environment.programMemory.origin(20);
    const secondLine = testLine("A_LABEL");
    const secondResult = environment.programMemory.pipeline(secondLine);
    assert(secondResult.failed(), "Unexpected success");
    secondResult.failures().forEach((failure, index) => {
        assertEquals(index, 0);
        assertFailureWithExtra(failure, "context_redefined", "10");
    });
});
