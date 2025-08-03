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
    expect(
        systemUnderTest.currentLine().failures()
    ).toEqual([{
        "kind": "device_notSelected", "location": undefined
    }, {
        "kind": "ram_sizeUnknown", "location": undefined
    }]);
});

Deno.test("A stack allocation can't be beyond available SRAM", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "test");
    systemUnderTest.symbolTable.deviceSymbol("ramStart", 0);
    systemUnderTest.symbolTable.deviceSymbol("ramEnd", 0xf0);
    const bytesRequested = 0xf2;
    systemUnderTest.dataMemory.allocStack(bytesRequested);
    expect(
        systemUnderTest.currentLine().failures()
    ).toEqual([{
        "kind": "ram_outOfRange", "location": undefined,
        "expected": `${0xf0}`, "actual": `${bytesRequested}`
    }]);
});

Deno.test("A memory allocation can't be beyond available SRAM", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "test");
    systemUnderTest.symbolTable.deviceSymbol("ramStart", 0);
    systemUnderTest.symbolTable.deviceSymbol("ramEnd", 0xf0);
    const bytesRequested = 0xf2;
    systemUnderTest.dataMemory.alloc("plop", bytesRequested);
    expect(
        systemUnderTest.currentLine().failures()
    ).toEqual([{
        "kind": "ram_outOfRange", "location": undefined,
        "expected": `${0xf0}`, "actual": `${bytesRequested}`
    }]);
});

Deno.test("Memory allocations start at the top of SRAM and work down", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "test");
    systemUnderTest.symbolTable.deviceSymbol("ramStart", 0);
    systemUnderTest.symbolTable.deviceSymbol("ramEnd", 0xff);
    [0, 25, 50].forEach((expectedStartAddress) => {
        const name = `plop${expectedStartAddress}`;
        systemUnderTest.dataMemory.alloc(name, 25);
        expect(systemUnderTest.currentLine().failures()).toEqual([]);
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
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    const bytesAvailable = 0x1f - bytesRequested;

    systemUnderTest.dataMemory.alloc("failed", bytesRequested);
    expect(
        systemUnderTest.currentLine().failures()
    ).toEqual([{
        "kind": "ram_outOfRange", "location": undefined,
        "expected": `${bytesAvailable}`, "actual": `${bytesRequested}`
    }]);
});

Deno.test("Memory allocations decrease the available SRAM", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "test");
    systemUnderTest.symbolTable.deviceSymbol("ramStart", 0x00);
    systemUnderTest.symbolTable.deviceSymbol("ramEnd", 0x1f);
    const bytesRequested = 0x19;

    systemUnderTest.dataMemory.alloc("passing", bytesRequested);
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    const bytesAvailable = 0x1f - bytesRequested;

    systemUnderTest.dataMemory.alloc("failing", bytesRequested);
    expect(
        systemUnderTest.currentLine().failures()
    ).toEqual([{
        "kind": "ram_outOfRange", "location": undefined,
        "expected": `${bytesAvailable}`, "actual": `${bytesRequested}`
    }]);
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
            expect(systemUnderTest.currentLine().failures()).toEqual([]);
            const startAddress = systemUnderTest.symbolTable.internalValue(name);
            expect(startAddress).toBe(expectedStartAddress);
        });
        systemUnderTest.dataMemory.reset(pass);
        systemUnderTest.symbolTable.reset(pass);
    });
});
