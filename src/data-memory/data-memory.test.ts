import { assertEquals } from "assert";
import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { directiveFunction } from "../directives/directive-function.ts";
import { extractedFailures } from "../failure/bags.ts";
import { assertFailureKind, assertSuccessWith } from "../failure/testing.ts";
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
    const result = alloc(23);
    assertEquals(result.type, "failures");
    assertFailureKind(extractedFailures(result), "ram_sizeUnknown");
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
    const result = allocStack(0xf2);
    assertEquals(result.type, "failures");
    assertFailureKind(extractedFailures(result), "ram_outOfRange");
});

Deno.test("A memory allocation can't be beyond available SRAM", () => {
    const system = systemUnderTest();
    system.device.property("deviceName", "test");
    system.device.property("ramStart", "00");
    system.device.property("ramEnd", "F0");
    const alloc = directiveFunction(
        irrelevantName, system.dataMemory.allocDirective
    );

    system.pass.second();
    const result = alloc(0xf2);
    assertEquals(result.type, "failures");
    assertFailureKind(extractedFailures(result), "ram_outOfRange");

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
    assertSuccessWith(alloc(25), "0");
    assertSuccessWith(alloc(25), "25");
    assertSuccessWith(alloc(25), "50");
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
    assertSuccessWith(alloc(25), "0");

    const first = allocStack(25);
    assertEquals(first.type, "failures");
    assertFailureKind(extractedFailures(first), "ram_outOfRange");

    const second = alloc(25);
    assertEquals(second.type, "failures");
    assertFailureKind(extractedFailures(second), "ram_outOfRange");
});

Deno.test("Allocations don't get repeated on the second pass", () => {
    const system = systemUnderTest();
    system.device.property("deviceName", "test");
    system.device.property("ramStart", "00");
    system.device.property("ramEnd", "FF");
    const alloc = directiveFunction(
        irrelevantName, system.dataMemory.allocDirective
    );

    assertSuccessWith(alloc(25), "0");
    assertSuccessWith(alloc(25), "25");
    system.pass.second();
    assertSuccessWith(alloc(25), "0");
    assertSuccessWith(alloc(25), "25");
});
