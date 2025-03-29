import { expect } from "jsr:@std/expect";
import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { directiveFunction } from "../directives/directive-function.ts";
import type { Failure, MemoryRangeFailure, OldFailure } from "../failure/bags.ts";
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
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(5);
    expect(failures[0]!.kind).toBe("device_notSelected");
    expect(failures[1]!.kind).toBe("symbol_notFound");
    expect((failures[1] as OldFailure).extra).toEqual([undefined, "ramStart"]);
    expect(failures[2]!.kind).toBe("device_notSelected");
    expect(failures[3]!.kind).toBe("symbol_notFound");
    expect((failures[3] as OldFailure).extra).toEqual([undefined, "ramEnd"]);
    expect(failures[4]!.kind).toBe("ram_sizeUnknown");
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
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as MemoryRangeFailure;
    expect(failure.kind).toBe("ram_outOfRange");
    expect(failure.bytesAvailable).toBe(0xf0);
    expect(failure.bytesRequested).toBe(bytesRequested);
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
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as MemoryRangeFailure;
    expect(failure.kind).toBe("ram_outOfRange");
    expect(failure.bytesAvailable).toBe(0xf0);
    expect(failure.bytesRequested).toBe(bytesRequested);
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
    ["0", "25", "50"].forEach((expectedStartAddress) => {
        const result = alloc(25);
        expect(result.type).not.toBe("failures");
        expect(result.it).toBe(expectedStartAddress);
    });
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
    const allocation = allocStack(bytesRequested);
    expect(allocation.type).not.toBe("failures");
    expect(allocation.it).toBe("");
    const bytesAvailable = 0x1f - bytesRequested;

    const failing = alloc(bytesRequested);
    expect(failing.type).toBe("failures");
    const failures = failing.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as MemoryRangeFailure;
    expect(failure.kind).toBe("ram_outOfRange");
    expect(failure.bytesAvailable).toBe(bytesAvailable);
    expect(failure.bytesRequested).toBe(bytesRequested);
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
    const allocation = alloc(bytesRequested);
    expect(allocation.type).not.toBe("failures");
    expect(allocation.it).toBe("0");
    const bytesAvailable = 0x1f - bytesRequested;

    const failing = alloc(bytesRequested);
    expect(failing.type).toBe("failures");
    const failures = failing.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as MemoryRangeFailure;
    expect(failure.kind).toBe("ram_outOfRange");
    expect(failure.bytesAvailable).toBe(bytesAvailable);
    expect(failure.bytesRequested).toBe(bytesRequested);
});

Deno.test("Allocations don't get repeated on the second pass", () => {
    const system = systemUnderTest();
    system.device.property("deviceName", "test");
    system.device.property("ramStart", "00");
    system.device.property("ramEnd", "FF");
    const alloc = directiveFunction(
        irrelevantName, system.dataMemory.allocDirective
    );

    [1, 2].forEach((pass) => {
        if (pass == 2) {
            system.pass.second();
        }
        ["0", "25"].forEach((expectedStartAddress) => {
            const result = alloc(25);
            expect(result.type).not.toBe("failures");
            expect(result.it).toBe(expectedStartAddress);
        });
    });
});
