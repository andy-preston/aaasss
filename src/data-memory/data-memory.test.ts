import { assertEquals } from "assert";
import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { directiveFunction } from "../directives/directive-function.ts";
import { Failure, OldFailure, MemoryRangeFailure } from "../failure/bags.ts";
import { assertSuccessWith } from "../failure/testing.ts";
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
    const failures = result.it as Array<Failure>;
    assertEquals(failures.length, 3);
    assertEquals(failures[0]!.kind, "device_notSelected");
    assertEquals((failures[0] as OldFailure).extra, ["ramStart"]);
    assertEquals(failures[1]!.kind, "device_notSelected");
    assertEquals((failures[1] as OldFailure).extra, ["ramEnd"]);
    assertEquals(failures[2]!.kind, "ram_sizeUnknown");
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
    const bytesRequested = 0xf2;
    const result = allocStack(bytesRequested);
    assertEquals(result.type, "failures");
    const failures = result.it as Array<Failure>;
    assertEquals(failures.length, 1);
    const failure = failures[0] as MemoryRangeFailure;
    assertEquals(failure.kind, "ram_outOfRange");
    assertEquals(failure.bytesAvailable, 0xf0);
    assertEquals(failure.bytesRequested, bytesRequested);
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
    const bytesRequested = 0xf2;
    const result = alloc(bytesRequested);
    assertEquals(result.type, "failures");
    const failures = result.it as Array<Failure>;
    assertEquals(failures.length, 1);
    const failure = failures[0] as MemoryRangeFailure;
    assertEquals(failure.kind, "ram_outOfRange");
    assertEquals(failure.bytesAvailable, 0xf0);
    assertEquals(failure.bytesRequested, bytesRequested);
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

Deno.test("Stack allocations decrease the available SRAM", () => {
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
    const bytesRequested = 0x19;

    system.pass.second();
    assertSuccessWith(alloc(bytesRequested), "0");
    const bytesAvailable = 0x1f - bytesRequested;

    const result = allocStack(bytesRequested);
    assertEquals(result.type, "failures");
    const failures = result.it as Array<Failure>;
    assertEquals(failures.length, 1);
    const failure = failures[0] as MemoryRangeFailure;
    assertEquals(failure.kind, "ram_outOfRange");
    assertEquals(failure.bytesAvailable, bytesAvailable);
    assertEquals(failure.bytesRequested, bytesRequested);
});

Deno.test("Memory allocations decrease the available SRAM", () => {
    const system = systemUnderTest();
    system.device.property("deviceName", "test");
    system.device.property("ramStart", "00");
    system.device.property("ramEnd", "1F");
    const alloc = directiveFunction(
        irrelevantName, system.dataMemory.allocDirective
    );
    const bytesRequested = 0x19;

    system.pass.second();
    assertSuccessWith(alloc(bytesRequested), "0");
    const bytesAvailable = 0x1f - bytesRequested;

    const result = alloc(bytesRequested);
    assertEquals(result.type, "failures");
    const failures = result.it as Array<Failure>;
    assertEquals(failures.length, 1);
    const failure = failures[0] as MemoryRangeFailure;
    assertEquals(failure.kind, "ram_outOfRange");
    assertEquals(failure.bytesAvailable, bytesAvailable);
    assertEquals(failure.bytesRequested, bytesRequested);
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
