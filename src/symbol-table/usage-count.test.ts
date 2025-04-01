import { expect } from "jsr:@std/expect";
import { numberBag } from "../assembler/bags.ts";
import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "./symbol-table.ts";

const systemUnderTest = () => {
    const currentPass = pass();
    const symbols = symbolTable(
        deviceProperties().public, cpuRegisters(), currentPass
    );
    return {
        "pass": currentPass,
        "symbols": symbols,
        "list": () => symbols.list()
    };
};

Deno.test("A freshly added symbol has a count of zero", () => {
    const system = systemUnderTest();
    system.symbols.constantSymbol("plop", numberBag(23), "file-name.asm", 10);
    const result = system.list();
    expect(result.length).toBe(1);
    const [symbolName, usageCount, symbolValue, definition] = result[0]!;
    expect(symbolName).toBe("plop");
    expect(usageCount).toBe(0);
    expect(symbolValue).toBe(23);
    expect(definition).toBe("file-name.asm:10")
});

Deno.test("Each call to use increments the usage", () => {
    const system = systemUnderTest();
    system.symbols.constantSymbol("plop", numberBag(23), "file-name.asm", 10);
    [1, 2, 3, 4].forEach((expectedCount) => {
        system.symbols.use("plop");
        const result = system.list();
        expect(result.length).toBe(1);
        const [symbolName, usageCount, symbolValue, definition] = result[0]!;
        expect(symbolName).toBe("plop");
        expect(usageCount).toBe(expectedCount);
        expect(symbolValue).toBe(23);
        expect(definition).toBe("file-name.asm:10")
    });
});
