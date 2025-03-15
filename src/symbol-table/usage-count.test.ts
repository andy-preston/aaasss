import { assertEquals } from "assert";
import { symbolTable } from "./symbol-table.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";

const systemUnderTest = () => {
    return {
        "symbolTable": symbolTable(cpuRegisters()),
    };
};

Deno.test("A freshly added symbol has a count of zero", () => {
    const system = systemUnderTest();
    system.symbolTable.add("plop", 23, "file-name.asm", 10);
    const list = system.symbolTable.list();
    assertEquals(list.length, 1);
    const [symbolName, usageCount, symbolValue, definition] = list[0]!;
    assertEquals(symbolName, "plop");
    assertEquals(usageCount, 0);
    assertEquals(symbolValue, 23);
    assertEquals(definition, "file-name.asm:10")
});

Deno.test("Each call to use increments the usage", () => {
    const system = systemUnderTest();
    system.symbolTable.add("plop", 23, "file-name.asm", 10);
    [1, 2, 3, 4].forEach((expectedCount) => {
        system.symbolTable.use("plop");
        const list = system.symbolTable.list();
        assertEquals(list.length, 1);
        const [symbolName, usageCount, symbolValue, definition] = list[0]!;
        assertEquals(symbolName, "plop");
        assertEquals(usageCount, expectedCount);
        assertEquals(symbolValue, 23);
        assertEquals(definition, "file-name.asm:10")
    });
});
