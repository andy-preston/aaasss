import { expect } from "jsr:@std/expect";
import { numberBag } from "../assembler/bags.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("A freshly added symbol has a count of zero", () => {
    const system = systemUnderTest();
    system.symbolTable.persistentSymbol("plop", numberBag(23));
    const result = system.symbolTable.list();
    expect(result.length).toBe(1);
    const [symbolName, symbolValue, _definition, usageCount] = result[0]!;
    expect(symbolName).toBe("plop");
    expect(usageCount).toBe(0);
    expect(symbolValue).toBe(23);
});

Deno.test("Each call to use increments the usage", () => {
    const system = systemUnderTest();
    system.symbolTable.persistentSymbol("plop", numberBag(23));
    [1, 2, 3, 4].forEach((expectedCount) => {
        system.symbolTable.use("plop");
        const result = system.symbolTable.list();
        expect(result.length).toBe(1);
        const [symbolName, symbolValue, _definition, usageCount] = result[0]!;
        expect(symbolName).toBe("plop");
        expect(usageCount).toBe(expectedCount);
        expect(symbolValue).toBe(23);
    });
});
