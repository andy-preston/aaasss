import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { dataMemory } from "./data-memory.ts";

const systemUnderTest = () => {
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
    const system = systemUnderTest();
    system.pass.second();
    const allocation = system.dataMemory.alloc(23);
    assertFailure(allocation, "ram_sizeUnknown");
});

Deno.test("A stack allocation can't be beyond available SRAM", () => {
    const system = systemUnderTest();
    system.device.property("deviceName", "test");
    system.device.property("ramStart", "00");
    system.device.property("ramEnd", "F0");
    system.pass.second();
    const allocation = system.dataMemory.allocStack(0xf2);
    assertFailure(allocation, "ram_outOfRange");
});

Deno.test("A memory allocation can't be beyond available SRAM", () => {
    const system = systemUnderTest();
    system.device.property("deviceName", "test");
    system.device.property("ramStart", "00");
    system.device.property("ramEnd", "F0");
    system.pass.second();
    const allocation = system.dataMemory.allocStack(0xf2);
    assertFailure(allocation, "ram_outOfRange");
});

Deno.test("Memory allocations start at the top of SRAM and work down", () => {
    const system = systemUnderTest();
    system.device.property("deviceName", "test");
    system.device.property("ramStart", "00");
    system.device.property("ramEnd", "FF");
    system.pass.second();
    assertSuccess(system.dataMemory.alloc(25), "0");
    assertSuccess(system.dataMemory.alloc(25), "25");
    assertSuccess(system.dataMemory.alloc(25), "50");
});

Deno.test("Stack and memory allocations both decrease the available SRAM", () => {
    const system = systemUnderTest();
    system.device.property("deviceName", "test");
    system.device.property("ramStart", "00");
    system.device.property("ramEnd", "1F");
    system.pass.second();
    assertSuccess(system.dataMemory.alloc(25), "0");
    system.dataMemory.allocStack(25);
    const allocation = system.dataMemory.alloc(23);
    assertFailure(allocation, "ram_outOfRange");
});

Deno.test("Allocations don't get repeated on the second pass", () => {
    const system = systemUnderTest();
    system.device.property("deviceName", "test");
    system.device.property("ramStart", "00");
    system.device.property("ramEnd", "FF");
    assertSuccess(system.dataMemory.alloc(25), "0");
    assertSuccess(system.dataMemory.alloc(25), "25");
    system.pass.second();
    assertSuccess(system.dataMemory.alloc(25), "0");
    assertSuccess(system.dataMemory.alloc(25), "25");
});
