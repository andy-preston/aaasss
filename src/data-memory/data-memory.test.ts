import type { AssertionFailure, Failure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { numberBag, stringBag } from "../assembler/bags.ts";
import { passes } from "../assembler/data-types.ts";
import { currentLine } from "../line/current-line.ts";
import { dummyLine } from "../line/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { dataMemory } from "./data-memory.ts";

const testSystem = () => {
    const $currentLine = currentLine();
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $dataMemory = dataMemory($symbolTable);
    return {
        "symbolTable": $symbolTable,
        "dataMemory": $dataMemory
    };
};

Deno.test("A device must be selected before SRAM can be allocated", () => {
    const system = testSystem();
    const result = system.dataMemory.alloc(23);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(3);
    expect(failures[0]!.kind).toBe("device_notSelected");
    expect(failures[1]!.kind).toBe("device_notSelected");
    expect(failures[2]!.kind).toBe("ram_sizeUnknown");
});

Deno.test("A stack allocation can't be beyond available SRAM", () => {
    const system = testSystem();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("ramStart", numberBag(0));
    system.symbolTable.deviceSymbol("ramEnd", numberBag(0xf0));
    const bytesRequested = 0xf2;
    const result = system.dataMemory.allocStack(bytesRequested);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as AssertionFailure;
    expect(failure.kind).toBe("ram_outOfRange");
    expect(failure.expected).toBe(`${0xf0}`);
    expect(failure.actual).toBe(`${bytesRequested}`);
});

Deno.test("A memory allocation can't be beyond available SRAM", () => {
    const system = testSystem();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("ramStart", numberBag(0));
    system.symbolTable.deviceSymbol("ramEnd", numberBag(0xf0));
    const bytesRequested = 0xf2;
    const result = system.dataMemory.alloc(bytesRequested);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as AssertionFailure;
    expect(failure.kind).toBe("ram_outOfRange");
    expect(failure.expected).toBe(`${0xf0}`);
    expect(failure.actual).toBe(`${bytesRequested}`);
});

Deno.test("Memory allocations start at the top of SRAM and work down", () => {
    const system = testSystem();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("ramStart", numberBag(0));
    system.symbolTable.deviceSymbol("ramEnd", numberBag(0xff));
    ["0", "25", "50"].forEach((expectedStartAddress) => {
        const result = system.dataMemory.alloc(25);
        expect(result.type).not.toBe("failures");
        expect(result.it).toBe(expectedStartAddress);
    });
});

Deno.test("Stack allocations decrease the available SRAM", () => {
    const system = testSystem();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("ramStart", numberBag(0x00));
    system.symbolTable.deviceSymbol("ramEnd", numberBag(0x1f));
    const bytesRequested = 0x19;

    const allocation = system.dataMemory.allocStack(bytesRequested);
    expect(allocation.type).not.toBe("failures");
    expect(allocation.it).toBe("");
    const bytesAvailable = 0x1f - bytesRequested;

    const failing = system.dataMemory.alloc(bytesRequested);
    expect(failing.type).toBe("failures");
    const failures = failing.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as AssertionFailure;
    expect(failure.kind).toBe("ram_outOfRange");
    expect(failure.expected).toBe(`${bytesAvailable}`);
    expect(failure.actual).toBe(`${bytesRequested}`);
});

Deno.test("Memory allocations decrease the available SRAM", () => {
    const system = testSystem();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("ramStart", numberBag(0x00));
    system.symbolTable.deviceSymbol("ramEnd", numberBag(0x1f));
    const bytesRequested = 0x19;

    const allocation = system.dataMemory.alloc(bytesRequested);
    expect(allocation.type).not.toBe("failures");
    expect(allocation.it).toBe("0");
    const bytesAvailable = 0x1f - bytesRequested;

    const failing = system.dataMemory.alloc(bytesRequested);
    expect(failing.type).toBe("failures");
    const failures = failing.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as AssertionFailure;
    expect(failure.kind).toBe("ram_outOfRange");
    expect(failure.expected).toBe(`${bytesAvailable}`);
    expect(failure.actual).toBe(`${bytesRequested}`);
});

Deno.test("Allocations aren't considered repeated on the second pass", () => {
    const system = testSystem();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("ramStart", numberBag(0x00));
    system.symbolTable.deviceSymbol("ramEnd", numberBag(0xff));
    passes.forEach(pass => {
        ["0", "25"].forEach(expectedStartAddress => {
            const result = system.dataMemory.alloc(25);
            expect(result.type).not.toBe("failures");
            expect(result.it).toBe(expectedStartAddress);
        });
        system.dataMemory.reset(dummyLine(true, pass));
    });
});
