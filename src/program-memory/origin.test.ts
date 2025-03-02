import { assertEquals } from "assert";
import { assertFailure, assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("A device must be selected before program memory can be set", () => {
    const system = systemUnderTest();
    assertFailure(
        system.programMemory.originDirective.body(10),
        "programMemory_sizeUnknown"
    );
});

Deno.test("Origin addresses can't be less than zero", () => {
    const system = systemUnderTest();
    assertFailureWithExtra(
        system.programMemory.originDirective.body(-1),
        "type_positive",
        ["-1", "0", ""]
    );
});

Deno.test("Origin addresses can't be strange type", () => {
    const system = systemUnderTest();
    assertFailureWithExtra(
        system.programMemory.originDirective.body("nothing" as unknown as number),
        "type_positive",
        ["nothing", "0", ""]
    );
});

Deno.test("Device name is used to determine if properties have been set", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("programMemoryBytes", "FF");
    assertFailure(
        system.programMemory.originDirective.body(10),
        "programMemory_sizeUnknown"
    );
});

Deno.test("Origin addresses must be progmem size when a device is chosen", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    const bytes = 100;
    const words = bytes / 2;
    system.deviceProperties.property(
        "programMemoryBytes", bytes.toString(16).toUpperCase()
    );
    assertFailureWithExtra(
        system.programMemory.originDirective.body(92),
        "programMemory_outOfRange",
        [`${words}`]
    );
});

Deno.test("Origin directive sets current address", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");

    assertSuccess(
        system.programMemory.originDirective.body(23),
        "23"
    );
    assertEquals(system.programMemory.address(), 23);

    assertSuccess(
        system.programMemory.originDirective.body(42),
        "42"
    );
    assertEquals(system.programMemory.address(), 42);
});
