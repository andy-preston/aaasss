import { assertEquals } from "assert";
import { assertFailure, assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { systemUnderTest } from "./testing.ts";
import { directiveFunction } from "../directives/directive-function.ts";

const irrelevantName = "testing";

Deno.test("A device must be selected before program memory can be set", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );
    assertFailure(origin(10), "programMemory_sizeUnknown");
});

Deno.test("Origin addresses can't be less than zero", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );
    assertFailureWithExtra(origin(-1), "type_positive", ["-1", "0", ""]);
});

Deno.test("Origin addresses can't be strange type", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );
    assertFailureWithExtra(
        origin("nothing"), "parameter_type", ["number", "0: string"]
    );
});

Deno.test("Device name is used to determine if properties have been set", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );
    system.deviceProperties.property("programMemoryBytes", "FF");
    assertFailure(origin(10), "programMemory_sizeUnknown");
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
    assertFailureWithExtra(
        origin(92), "programMemory_outOfRange", [`${words}`]
    );
});

Deno.test("Origin directive sets current address", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");

    assertSuccess(origin(23), "");
    assertEquals(system.programMemory.address(), 23);

    assertSuccess(origin(42), "");
    assertEquals(system.programMemory.address(), 42);
});
