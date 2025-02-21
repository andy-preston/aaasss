import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { dataMemory } from "./data-memory.ts";

const testEnvironment = () => {
    const currentPass = pass();
    const device = deviceProperties();
    const memory = dataMemory(device.public);
    currentPass.resetStateCallback(memory.reset);
    return {
        "pass": currentPass,
        "device": device,
        "dataMemory": memory
    };
};

Deno.test("A device must be selected before SRAM can be allocated", () => {
    const environment = testEnvironment();
    environment.pass.second();
    const allocation = environment.dataMemory.alloc(23);
    assertFailure(allocation, "ram_sizeUnknown");
});

Deno.test("A stack allocation can't be beyond available SRAM", () => {
    const environment = testEnvironment();
    environment.device.property("deviceName", "test");
    environment.device.property("ramStart", "00");
    environment.device.property("ramEnd", "F0");
    environment.pass.second();
    const allocation = environment.dataMemory.allocStack(0xf2);
    assertFailure(allocation, "ram_outOfRange");
});

Deno.test("A memory allocation can't be beyond available SRAM", () => {
    const environment = testEnvironment();
    environment.device.property("deviceName", "test");
    environment.device.property("ramStart", "00");
    environment.device.property("ramEnd", "F0");
    environment.pass.second();
    const allocation = environment.dataMemory.allocStack(0xf2);
    assertFailure(allocation, "ram_outOfRange");
});

Deno.test("Memory allocations start at the top of SRAM and work down", () => {
    const environment = testEnvironment();
    environment.device.property("deviceName", "test");
    environment.device.property("ramStart", "00");
    environment.device.property("ramEnd", "FF");
    environment.pass.second();
    assertSuccess(environment.dataMemory.alloc(25), "0");
    assertSuccess(environment.dataMemory.alloc(25), "25");
    assertSuccess(environment.dataMemory.alloc(25), "50");
});

Deno.test("Stack and memory allocations both decrease the available SRAM", () => {
    const environment = testEnvironment();
    environment.device.property("deviceName", "test");
    environment.device.property("ramStart", "00");
    environment.device.property("ramEnd", "1F");
    environment.pass.second();
    assertSuccess(environment.dataMemory.alloc(25), "0");
    environment.dataMemory.allocStack(25);
    const allocation = environment.dataMemory.alloc(23);
    assertFailure(allocation, "ram_outOfRange");
});

Deno.test("Allocations don't get repeated on the second pass", () => {
    const environment = testEnvironment();
    environment.device.property("deviceName", "test");
    environment.device.property("ramStart", "00");
    environment.device.property("ramEnd", "FF");
    assertSuccess(environment.dataMemory.alloc(25), "0");
    assertSuccess(environment.dataMemory.alloc(25), "25");
    environment.pass.second();
    assertSuccess(environment.dataMemory.alloc(25), "0");
    assertSuccess(environment.dataMemory.alloc(25), "25");
});
