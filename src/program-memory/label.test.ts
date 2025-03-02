import { assert, assertEquals, assertFalse } from "assert";
import { assertSuccess } from "../failure/testing.ts";
import { systemUnderTest, testLine } from "./testing.ts";

Deno.test("A label is stored in the symbol table with the current address", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");
    system.programMemory.originDirective.body(10);

    const line = testLine("A_LABEL", [], []);
    const result = system.programMemory.addressed(line);
    assertFalse(result.failed(), "Unexpected failure");
    assertEquals(result.failures.length, 0);
    assertEquals(
        system.symbolTable.use("A_LABEL"),
        { "type": "number", "body": 10 }
    );
});

Deno.test("Labels can only be redefined if their value doesn't change", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");
    const line = testLine("A_LABEL", [], []);

    system.programMemory.originDirective.body(10);
    system.programMemory.addressed(line);

    system.pass.second();
    system.programMemory.originDirective.body(10);
    assertFalse(
        system.programMemory.addressed(line).failed()
    );
    assertEquals(
        system.symbolTable.use("A_LABEL"),
        { "type": "number", "body": 10 }
    );

    system.programMemory.originDirective.body(20);
    assert(
        system.programMemory.addressed(line).failed()
    );
    assertEquals(
        system.symbolTable.use("A_LABEL"),
        { "type": "number", "body": 10 }
    );
});

Deno.test("Labels are available to javascript", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");
    system.pass.second();

    system.programMemory.originDirective.body(10);
    system.programMemory.addressed(
        testLine("A_LABEL", [], [])
    );
    assertSuccess(system.jsExpression("A_LABEL"), "10");
});
