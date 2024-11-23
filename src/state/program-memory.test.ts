import { assertEquals } from "assert";
import { newContext } from "../context/context.ts";
import { deviceProperties } from "../device/properties.ts";
import { Box, Failure } from "../value-or-failure.ts";
import { newProgramMemory } from "./program-memory.ts";

Deno.test("A device must be selected before program memory can be set", () => {
    const memory = newProgramMemory(deviceProperties(newContext()));
    const result = memory.origin(10);
    assertEquals(result.which, "failure");
    assertEquals((result as Failure).kind, "programMemory.sizeUnknown");
    assertEquals((result as Failure).extra, "10");
});

Deno.test("org addresses can't be less than zero", () => {
    const memory = newProgramMemory(deviceProperties(newContext()));
    const result = memory.origin(-1);
    assertEquals(result.which, "failure");
    assertEquals((result as Failure).kind, "address.negative");
    assertEquals((result as Failure).extra, "-1");
});

Deno.test("Device name is used to determine if properties have been set", () => {
    const properties = deviceProperties(newContext());
    const memory = newProgramMemory(properties);
    properties.programMemoryBytes(100);
    const result = memory.origin(10);
    assertEquals(result.which, "failure");
    assertEquals((result as Failure).kind, "programMemory.sizeUnknown");
    assertEquals((result as Failure).extra, "10");
});

Deno.test("org addresses must be progmem size when a device is chosen", () => {
    const properties = deviceProperties(newContext());
    const memory = newProgramMemory(properties);
    properties.setName("testing");
    properties.programMemoryBytes(100);
    const result = memory.origin(92);
    assertEquals(result.which, "failure");
    assertEquals((result as Failure).kind, "programMemory.outOfRange");
    assertEquals((result as Failure).extra, "92");
});

Deno.test("programMemoryOrigin directive sets current address", () => {
    const properties = deviceProperties(newContext());
    const memory = newProgramMemory(properties);
    properties.setName("testing");
    properties.programMemoryBytes(100);

    const first = memory.origin(23);
    assertEquals(first.which, "box");
    assertEquals((first as Box<number>).value, 23);
    assertEquals(memory.address(), 23);

    const second = memory.origin(42);
    assertEquals(second.which, "box");
    assertEquals((second as Box<number>).value, 42);
    assertEquals(memory.address(), 42);
});
