import { expect } from "jsr:@std/expect";
import { numberBag } from "../assembler/bags.ts";
import { dummyLine } from "../line/line-types.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("The symbol table is reset at the end of the first pass", () => {
    const system = systemUnderTest();
    {
        const result = system.symbolTable.persistentSymbol(
            "plop", numberBag(57)
        );
        expect(result.type).not.toBe("failures");
    }
    [1, 2, 3].forEach(expectedCount => {
        const use = system.symbolTable.use("plop");
        expect(use).toEqual(numberBag(57));
        expect(system.symbolTable.count("plop")).toBe(expectedCount);
    });
    system.symbolTable.reset(
        dummyLine(true, 1)
    );
    expect(system.symbolTable.count("plop")).toEqual(0);
});

Deno.test("... but left intact at the end of the second pass", () => {
    const system = systemUnderTest();
    {
        const result = system.symbolTable.persistentSymbol(
            "plop", numberBag(57)
        );
        expect(result.type).not.toBe("failures");
    }
    [1, 2, 3].forEach(expectedCount => {
        const use = system.symbolTable.use("plop");
        expect(use).toEqual(numberBag(57));
        expect(system.symbolTable.count("plop")).toBe(expectedCount);
    });
    system.symbolTable.reset(
        dummyLine(true, 2)
    );
    expect(system.symbolTable.count("plop")).toEqual(3);
});
