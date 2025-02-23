import { assertEquals } from "assert";
import { assertFailure, assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("A device must be selected before program memory can be set", () => {
    const system = systemUnderTest();
    const result = system.programMemory.originDirective(10);
    assertFailure(result, "programMemory_sizeUnknown");
});

Deno.test("Origin addresses can't be less than zero", () => {
    const system = systemUnderTest();
    const result = system.programMemory.originDirective(-1);
    assertFailureWithExtra(result, "type_positive", ["-1", "0", ""]);
});

Deno.test("Origin addresses can't be strange type", () => {
    const system = systemUnderTest();
    const result = system.programMemory.originDirective("nothing" as unknown as number);
    assertFailureWithExtra(result, "type_positive", ["nothing", "0", ""]);
});

Deno.test("Device name is used to determine if properties have been set", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("programMemoryBytes", "FF");
    const result = system.programMemory.originDirective(10);
    assertFailure(result, "programMemory_sizeUnknown");
});

Deno.test("Origin addresses must be progmem size when a device is chosen", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    const bytes = 100;
    const words = bytes / 2;
    system.deviceProperties.property(
        "programMemoryBytes", bytes.toString(16).toUpperCase()
    );
    const result = system.programMemory.originDirective(92);
    assertFailureWithExtra(result, "programMemory_outOfRange", [`${words}`]);
});

Deno.test("Origin directive sets current address", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");

    const first = system.programMemory.originDirective(23);
    assertSuccess(first, "23");
    assertEquals(system.programMemory.address(), 23);

    const second = system.programMemory.originDirective(42);
    assertSuccess(second, "42");
    assertEquals(system.programMemory.address(), 42);
});
