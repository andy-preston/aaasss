import { expect } from "jsr:@std/expect";
import { numberBag } from "../assembler/bags.ts";
import { dummyLine } from "../line/line-types.ts";
import { testSystem } from "./testing.ts";

Deno.test("The symbol table is reset at the end of the first pass", () => {
    const systemUnderTest = testSystem();
    {
        const result = systemUnderTest.symbolTable.persistentSymbol(
            "plop", numberBag(57)
        );
        expect(result.type).not.toBe("failures");
    }
    [1, 2, 3].forEach(expectedCount => {
        const use = systemUnderTest.symbolTable.use("plop");
        expect(use).toEqual(numberBag(57));
        expect(systemUnderTest.symbolTable.count("plop")).toBe(expectedCount);
    });
    systemUnderTest.symbolTable.reset(
        dummyLine(true, 1)
    );
    expect(systemUnderTest.symbolTable.count("plop")).toEqual(0);
});

Deno.test("... but left intact at the end of the second pass", () => {
    const systemUnderTest = testSystem();
    {
        const result = systemUnderTest.symbolTable.persistentSymbol(
            "plop", numberBag(57)
        );
        expect(result.type).not.toBe("failures");
    }
    [1, 2, 3].forEach(expectedCount => {
        const use = systemUnderTest.symbolTable.use("plop");
        expect(use).toEqual(numberBag(57));
        expect(systemUnderTest.symbolTable.count("plop")).toBe(expectedCount);
    });
    systemUnderTest.symbolTable.reset(
        dummyLine(true, 2)
    );
    expect(systemUnderTest.symbolTable.count("plop")).toEqual(3);
});
