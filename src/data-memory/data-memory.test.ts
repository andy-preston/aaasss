import type { AssertionFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { passes } from "../assembler/data-types.ts";
import { currentLine, emptyLine } from "../assembler/line.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { dataMemory } from "./data-memory.ts";

const testSystem = () => {
    const $currentLine = currentLine();
    $currentLine(emptyLine("plop.asm"));
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $dataMemory = dataMemory($currentLine, $symbolTable);
    return {
        "currentLine": $currentLine,
        "symbolTable": $symbolTable,
        "dataMemory": $dataMemory
    };
};

Deno.test("A device must be selected before SRAM can be allocated", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.dataMemory.alloc("plop", 23);
    const failures = systemUnderTest.currentLine().failures;
    expect(failures.length).toBe(2);
    expect(failures[0]!.kind).toBe("device_notSelected");
    expect(failures[1]!.kind).toBe("ram_sizeUnknown");
});

Deno.test("A stack allocation can't be beyond available SRAM", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "test");
    systemUnderTest.symbolTable.deviceSymbol("ramStart", 0);
    systemUnderTest.symbolTable.deviceSymbol("ramEnd", 0xf0);
    const bytesRequested = 0xf2;
    systemUnderTest.dataMemory.allocStack(bytesRequested);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure =
        systemUnderTest.currentLine().failures[0] as AssertionFailure;
    expect(failure.kind).toBe("ram_outOfRange");
    expect(failure.expected).toBe(`${0xf0}`);
    expect(failure.actual).toBe(`${bytesRequested}`);
});

Deno.test("A memory allocation can't be beyond available SRAM", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "test");
    systemUnderTest.symbolTable.deviceSymbol("ramStart", 0);
    systemUnderTest.symbolTable.deviceSymbol("ramEnd", 0xf0);
    const bytesRequested = 0xf2;
    systemUnderTest.dataMemory.alloc("plop", bytesRequested);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure =
        systemUnderTest.currentLine().failures[0] as AssertionFailure;
    expect(failure.kind).toBe("ram_outOfRange");
    expect(failure.expected).toBe(`${0xf0}`);
    expect(failure.actual).toBe(`${bytesRequested}`);
});

Deno.test("Memory allocations start at the top of SRAM and work down", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "test");
    systemUnderTest.symbolTable.deviceSymbol("ramStart", 0);
    systemUnderTest.symbolTable.deviceSymbol("ramEnd", 0xff);
    [0, 25, 50].forEach((expectedStartAddress) => {
        const name = `plop${expectedStartAddress}`;
        systemUnderTest.dataMemory.alloc(name, 25);
        expect(systemUnderTest.currentLine().failures.length).toBe(0);
        const startAddress = systemUnderTest.symbolTable.internalValue(name);
        expect(startAddress).toBe(expectedStartAddress);
    });
});

Deno.test("Stack allocations decrease the available SRAM", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "test");
    systemUnderTest.symbolTable.deviceSymbol("ramStart", 0x00);
    systemUnderTest.symbolTable.deviceSymbol("ramEnd", 0x1f);
    const bytesRequested = 0x19;

    systemUnderTest.dataMemory.allocStack(bytesRequested);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    const bytesAvailable = 0x1f - bytesRequested;

    systemUnderTest.dataMemory.alloc("failed", bytesRequested);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure =
        systemUnderTest.currentLine().failures[0] as AssertionFailure;
    expect(failure.kind).toBe("ram_outOfRange");
    expect(failure.expected).toBe(`${bytesAvailable}`);
    expect(failure.actual).toBe(`${bytesRequested}`);
});

Deno.test("Memory allocations decrease the available SRAM", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "test");
    systemUnderTest.symbolTable.deviceSymbol("ramStart", 0x00);
    systemUnderTest.symbolTable.deviceSymbol("ramEnd", 0x1f);
    const bytesRequested = 0x19;

    systemUnderTest.dataMemory.alloc("passing", bytesRequested);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    const bytesAvailable = 0x1f - bytesRequested;

    systemUnderTest.dataMemory.alloc("failing", bytesRequested);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure =
        systemUnderTest.currentLine().failures[0] as AssertionFailure;
    expect(failure.kind).toBe("ram_outOfRange");
    expect(failure.expected).toBe(`${bytesAvailable}`);
    expect(failure.actual).toBe(`${bytesRequested}`);
});

Deno.test("Allocations aren't considered repeated on the second pass", () => {
    const systemUnderTest = testSystem();
    passes.forEach(pass => {
        systemUnderTest.symbolTable.deviceSymbol("deviceName", "test");
        systemUnderTest.symbolTable.deviceSymbol("ramStart", 0x00);
        systemUnderTest.symbolTable.deviceSymbol("ramEnd", 0xff);
        [0, 25].forEach(expectedStartAddress => {
            const name = `plop${expectedStartAddress}`;
            systemUnderTest.dataMemory.alloc(name, 25);
            expect(systemUnderTest.currentLine().failures.length).toBe(0);
            const startAddress = systemUnderTest.symbolTable.internalValue(name);
            expect(startAddress).toBe(expectedStartAddress);
        });
        systemUnderTest.dataMemory.reset(pass);
        systemUnderTest.symbolTable.reset(pass);
    });
});
