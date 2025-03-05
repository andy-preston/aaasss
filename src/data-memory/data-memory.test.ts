import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { directiveFunction } from "../directives/directive-function.ts";
import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { dataMemory } from "./data-memory.ts";

const irrelevantName = "testing";

const systemUnderTest = () => {
    const currentPass = pass();
    const device = deviceProperties();
    const memory = dataMemory(device.public);
    currentPass.resetStateCallback(memory.resetState);
    return {
        "pass": currentPass,
        "device": device,
        "dataMemory": memory
    };
};

Deno.test("A device must be selected before SRAM can be allocated", () => {
    const system = systemUnderTest();
    const alloc = directiveFunction(
        irrelevantName, system.dataMemory.allocDirective
    );
    system.pass.second();
    assertFailure(alloc(23), "ram_sizeUnknown");
});

Deno.test("A stack allocation can't be beyond available SRAM", () => {
    const system = systemUnderTest();
    system.device.property("deviceName", "test");
    system.device.property("ramStart", "00");
    system.device.property("ramEnd", "F0");
    const allocStack = directiveFunction(
        irrelevantName, system.dataMemory.allocStackDirective
    );
    system.pass.second();
    assertFailure(allocStack(0xf2), "ram_outOfRange");
});

Deno.test("A memory allocation can't be beyond available SRAM", () => {
    const system = systemUnderTest();
    system.device.property("deviceName", "test");
    system.device.property("ramStart", "00");
    system.device.property("ramEnd", "F0");
    const allocStack = directiveFunction(
        irrelevantName, system.dataMemory.allocStackDirective
    );
    system.pass.second();
    assertFailure(allocStack(0xf2), "ram_outOfRange");
});

Deno.test("Memory allocations start at the top of SRAM and work down", () => {
    const system = systemUnderTest();
    system.device.property("deviceName", "test");
    system.device.property("ramStart", "00");
    system.device.property("ramEnd", "FF");
    const alloc = directiveFunction(
        irrelevantName, system.dataMemory.allocDirective
    );
    system.pass.second();
    assertSuccess(alloc(25), "0");
    assertSuccess(alloc(25), "25");
    assertSuccess(alloc(25), "50");
});

Deno.test("Stack and memory allocations both decrease the available SRAM", () => {
    const system = systemUnderTest();
    system.device.property("deviceName", "test");
    system.device.property("ramStart", "00");
    system.device.property("ramEnd", "1F");
    const alloc = directiveFunction(
        irrelevantName, system.dataMemory.allocDirective
    );
    const allocStack = directiveFunction(
        irrelevantName, system.dataMemory.allocStackDirective
    );
    system.pass.second();
    assertSuccess(alloc(25), "0");
    assertFailure(allocStack(25), "ram_outOfRange");
    assertFailure(alloc(23), "ram_outOfRange");
});

Deno.test("Allocations don't get repeated on the second pass", () => {
    const system = systemUnderTest();
    system.device.property("deviceName", "test");
    system.device.property("ramStart", "00");
    system.device.property("ramEnd", "FF");
    const alloc = directiveFunction(
        irrelevantName, system.dataMemory.allocDirective
    );
    assertSuccess(alloc(25), "0");
    assertSuccess(alloc(25), "25");
    system.pass.second();
    assertSuccess(alloc(25), "0");
    assertSuccess(alloc(25), "25");
});
