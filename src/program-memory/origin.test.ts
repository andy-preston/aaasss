import { assertEquals } from "assert";
import { anEmptyContext } from "../context/context.ts";
import { deviceProperties } from "../device/properties.ts";
import { Box, Failure } from "../value-or-failure.ts";
import { programMemory } from "./program-memory.ts";

const testEnvironment = () => {
    const context = anEmptyContext();
    const device = deviceProperties(context);
    const memory = programMemory(context, device);
    return {
        "device": device,
        "memory": memory
    };
};

Deno.test("A device must be selected before program memory can be set", () => {
    const environment = testEnvironment();
    const result = environment.memory.origin(10);
    assertEquals(result.which, "failure");
    assertEquals((result as Failure).kind, "programMemory.sizeUnknown");
    assertEquals((result as Failure).extra, "10");
});

Deno.test("Origin addresses can't be less than zero", () => {
    const environment = testEnvironment();
    const result = environment.memory.origin(-1);
    assertEquals(result.which, "failure");
    assertEquals((result as Failure).kind, "address.negative");
    assertEquals((result as Failure).extra, "-1");
});

Deno.test("Device name is used to determine if properties have been set", () => {
    const environment = testEnvironment();
    environment.device.programMemoryBytes(100);
    const result = environment.memory.origin(10);
    assertEquals(result.which, "failure");
    assertEquals((result as Failure).kind, "programMemory.sizeUnknown");
    assertEquals((result as Failure).extra, "10");
});

Deno.test("Origin addresses must be progmem size when a device is chosen", () => {
    const environment = testEnvironment();
    environment.device.setName("testing");
    environment.device.programMemoryBytes(100);
    const result = environment.memory.origin(92);
    assertEquals(result.which, "failure");
    assertEquals((result as Failure).kind, "programMemory.outOfRange");
    assertEquals((result as Failure).extra, "92");
});

Deno.test("Origin directive sets current address", () => {
    const environment = testEnvironment();
    environment.device.setName("testing");
    environment.device.programMemoryBytes(100);

    const first = environment.memory.origin(23);
    assertEquals(first.which, "box");
    assertEquals((first as Box<number>).value, 23);
    assertEquals(environment.memory.address(), 23);

    const second = environment.memory.origin(42);
    assertEquals(second.which, "box");
    assertEquals((second as Box<number>).value, 42);
    assertEquals(environment.memory.address(), 42);
});
