import { assertEquals } from "assert";
import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { directiveList } from "../directives/directive-list.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "./symbol-table.ts";

const systemUnderTest = () => {
    const currentPass = pass();
    const symbols = symbolTable(
        directiveList(), deviceProperties().public, cpuRegisters(), currentPass
    );
    return {
        "pass": currentPass,
        "symbols": symbols,
        "list": () => symbols.list()
    };
};

Deno.test("A freshly added symbol has a count of zero", () => {
    const system = systemUnderTest();
    system.symbols.add(
        "plop", { "type": "number", "body": 23 }, "file-name.asm", 10
    );
    const result = system.list();
    assertEquals(1, result.length);
    const [symbolName, usageCount, symbolValue, definition] = result[0]!;
    assertEquals(symbolName, "plop");
    assertEquals(usageCount, 0);
    assertEquals(symbolValue, 23);
    assertEquals(definition, "file-name.asm:10")
});

Deno.test("Each call to use increments the usage", () => {
    const system = systemUnderTest();
    system.symbols.add(
        "plop", { "type": "number", "body": 23 }, "file-name.asm", 10
    );
    [1, 2, 3, 4].forEach((expectedCount) => {
        system.symbols.use("plop");
        const result = system.list();
        assertEquals(1, result.length);
        const [symbolName, usageCount, symbolValue, definition] = result[0]!;
        assertEquals(symbolName, "plop");
        assertEquals(usageCount, expectedCount);
        assertEquals(symbolValue, 23);
        assertEquals(definition, "file-name.asm:10")
    });
});
