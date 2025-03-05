import { assert, assertEquals, assertFalse } from "assert";
import { assertSuccess } from "../failure/testing.ts";
import { systemUnderTest, testLine } from "./testing.ts";
import { directiveFunction } from "../directives/directive-function.ts";

const irrelevantName = "testing";

Deno.test("A label is stored in the symbol table with the current address", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );

    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");
    assertSuccess(origin(10), "");

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
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );

    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");
    const line = testLine("A_LABEL", [], []);

    assertSuccess(origin(10), "");
    system.programMemory.addressed(line);

    system.pass.second();
    assertSuccess(origin(10), "");
    assertFalse(system.programMemory.addressed(line).failed());
    assertEquals(
        system.symbolTable.use("A_LABEL"),
        { "type": "number", "body": 10 }
    );

    assertSuccess(origin(20), "");
    assert(system.programMemory.addressed(line).failed());
    assertEquals(
        system.symbolTable.use("A_LABEL"),
        { "type": "number", "body": 10 }
    );
});

Deno.test("Labels are available to javascript", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );

    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");

    system.pass.second();
    assertSuccess(origin(10), "");
    system.programMemory.addressed(testLine("A_LABEL", [], []));
    assertSuccess(system.jsExpression("A_LABEL"), "10");
});
