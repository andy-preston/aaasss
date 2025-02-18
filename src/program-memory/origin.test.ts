import { assertEquals } from "assert";
import { assertFailure, assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { testEnvironment } from "./testing.ts";

Deno.test("A device must be selected before program memory can be set", () => {
    const environment = testEnvironment();
    const result = environment.memory.origin(10);
    assertFailure(result, "programMemory_sizeUnknown");
});

Deno.test("Origin addresses can't be less than zero", () => {
    const environment = testEnvironment();
    const result = environment.memory.origin(-1);
    assertFailureWithExtra(result, "type_positive", ["-1"]);
});

Deno.test("Origin addresses can't be strange type", () => {
    const environment = testEnvironment();
    const result = environment.memory.origin("nothing" as unknown as number);
    assertFailureWithExtra(result, "type_positive", ["nothing"]);
});

Deno.test("Device name is used to determine if properties have been set", () => {
    const environment = testEnvironment();
    environment.device.property("programMemoryBytes", 100);
    const result = environment.memory.origin(10);
    assertFailure(result, "programMemory_sizeUnknown");
});

Deno.test("Origin addresses must be progmem size when a device is chosen", () => {
    const environment = testEnvironment();
    environment.device.property("deviceName", "test");
    const bytes = 100;
    const words = bytes / 2;
    environment.device.property("programMemoryBytes", bytes);
    const result = environment.memory.origin(92);
    assertFailureWithExtra(result, "programMemory_outOfRange", [`${words}`]);
});

Deno.test("Origin directive sets current address", () => {
    const environment = testEnvironment();
    environment.device.property("deviceName", "test");
    environment.device.property("programMemoryBytes", 100);

    const first = environment.memory.origin(23);
    assertSuccess(first, "23");
    assertEquals(environment.memory.address(), 23);

    const second = environment.memory.origin(42);
    assertSuccess(second, "42");
    assertEquals(environment.memory.address(), 42);
});
