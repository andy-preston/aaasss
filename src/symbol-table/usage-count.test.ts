import { assertEquals } from "assert";
import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { directiveList } from "../directives/directive-list.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "./symbol-table.ts";

const testEnvironment = () => {
    const currentPass = pass();
    const symbols = symbolTable(
        directiveList(), deviceProperties().public, cpuRegisters(), currentPass
    );
    return {
        "pass": currentPass,
        "symbols": symbols,
        "list": () => symbols.list().toArray()
    };
};

Deno.test("A freshly added symbol has a count of zero", () => {
    const environment = testEnvironment();
    environment.symbols.add("plop", 0);
    const result = environment.list();
    assertEquals(1, result.length);
    assertEquals("plop", result[0]);
    assertEquals(0, environment.symbols.count("plop"));
});

Deno.test("Each call to use increments the usage", () => {
    const environment = testEnvironment();
    environment.symbols.add("plop", 0);
    [1, 2, 3, 4].forEach((expectedCount) => {
        environment.symbols.use("plop");
        const result = environment.list();
        assertEquals(1, result.length);
        assertEquals("plop", result[0]);
        assertEquals(expectedCount, environment.symbols.count("plop"));
    });
});
