import { assertEquals } from "assert";
import { directiveFunction } from "../directives/directive-function.ts";
import { assertFailureKind, assertFailures, assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { systemUnderTest } from "./testing.ts";
import { extractedFailures } from "../failure/bags.ts";

const irrelevantName = "testing";

Deno.test("A device must be selected before program memory can be set", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );

    const result = origin(10);
    assertFailures(result);
    assertFailureKind(extractedFailures(result), "programMemory_sizeUnknown");
});

Deno.test("Origin addresses can't be less than zero", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );

    const result = origin(-1);
    assertFailures(result);
    assertFailureWithExtra(
        extractedFailures(result), "type_positive", ["-1", "0", ""]
    );
});

Deno.test("Origin addresses can't be strange type", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );

    const result = origin("nothing");
    assertFailures(result);
    assertFailureWithExtra(
        extractedFailures(result), "parameter_type", ["number", "0: string"]
    );
});

Deno.test("Device name is used to determine if properties have been set", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );
    system.deviceProperties.property("programMemoryBytes", "FF");

    const result = origin(10);
    assertFailures(result);
    assertFailureKind(extractedFailures(result), "programMemory_sizeUnknown");
});

Deno.test("Origin addresses must be progmem size when a device is chosen", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );
    system.deviceProperties.property("deviceName", "test");

    const bytes = 100;
    const words = bytes / 2;
    system.deviceProperties.property(
        "programMemoryBytes", bytes.toString(16).toUpperCase()
    );

    const result = origin(92);
    assertFailures(result);
    assertFailureWithExtra(
        extractedFailures(result), "programMemory_outOfRange", [`${words}`]
    );
});

Deno.test("Origin directive sets current address", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");

    assertSuccess(origin(23));
    assertEquals(system.programMemory.address(), 23);
    assertSuccess(origin(42));
    assertEquals(system.programMemory.address(), 42);
});
