import { assert, assertEquals, assertFalse } from "assert";
import { assertSuccess } from "../failure/testing.ts";
import { systemUnderTest, testLine } from "./testing.ts";

Deno.test("A label is stored in the symbol table with the current address", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");
    system.programMemory.originDirective(10);

    const line = testLine("A_LABEL", [], []);
    const result = system.programMemory.addressed(line);
    assertFalse(result.failed(), "Unexpected failure");
    assertEquals(result.failures.length, 0);
    assertEquals(system.symbolTable.use("A_LABEL"), 10);
});

Deno.test("Labels can only be redefined if their value doesn't change", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");
    const line = testLine("A_LABEL", [], []);

    system.programMemory.originDirective(10);
    system.programMemory.addressed(line);

    system.pass.second();
    system.programMemory.originDirective(10);
    const result1 = system.programMemory.addressed(line);
    assertFalse(result1.failed(), "Unexpected failure");
    assertEquals(system.symbolTable.use("A_LABEL"), 10);

    system.programMemory.originDirective(20);
    const result2 = system.programMemory.addressed(line);
    assert(result2.failed(), "Unexpected success");
    assertEquals(system.symbolTable.use("A_LABEL"), 10);
});

Deno.test("Labels are available to javascript", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");
    system.pass.second();

    system.programMemory.originDirective(10);
    system.programMemory.addressed(testLine("A_LABEL", [], []));
    assertSuccess(system.jsExpression("A_LABEL"), "10");
});
