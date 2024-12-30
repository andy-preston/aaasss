import { assert, assertEquals, assertFalse } from "assert";
import { assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { anEmptyContext } from "../context/context.ts";
import { deviceProperties } from "../device/properties.ts";
import { lineWithProcessedMacro } from "../macro/line-types.ts";
import { passes } from "../pass/pass.ts";
import { Label } from "../source-code/data-types.ts";
import {
    lineWithRawSource, lineWithRenderedJavascript
} from "../source-code/line-types.ts";
import { lineWithTokens } from "../tokenise/line-types.ts";
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
    const raw = lineWithRawSource("", 0, false, "", []);
    const rendered = lineWithRenderedJavascript(raw, "", []);
    const tokenised = lineWithTokens(rendered, label, "", [], []);
    return lineWithProcessedMacro(tokenised, "", []);
};

Deno.test("A label is stored in the context with the current address", () => {
    const environment = testEnvironment();
    environment.properties.setName("testDevice");
    environment.properties.programMemoryBytes(1024);
    environment.programMemory.origin(10);

    const result = environment.programMemory.label(testLine("A_LABEL"));
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
        const result = environment.programMemory.label(testLine("A_LABEL"));
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
    const firstResult = environment.programMemory.label(testLine("A_LABEL"));
    assertFalse(firstResult.failed(), "Unexpected failure");
    assertEquals(firstResult.failures.length, 0);

    environment.programMemory.origin(20);
    const secondResult = environment.programMemory.label(testLine("A_LABEL"));
    assert(secondResult.failed(), "Unexpected success");
    assertEquals(secondResult.failures.length, 1);
    assertFailureWithExtra(secondResult.failures[0]!, "context_redefined", "10");
});
