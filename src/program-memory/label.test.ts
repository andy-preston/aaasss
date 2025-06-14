import { expect } from "jsr:@std/expect";
import { numberBag, stringBag } from "../assembler/bags.ts";
import { dummyLine } from "../line/line-types.ts";
import { testSystem } from "./testing.ts";

Deno.test("A label is stored in the symbol table with the current address", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));
    {
        const result = systemUnderTest.programMemory.origin(10);
        expect(result.type).not.toBe("failures");
    } {
        const line = dummyLine(false, 1);
        line.label = "A_LABEL";
        systemUnderTest.programMemory.lineLabel(line);
        expect(line.failed(), "Unexpected failure").toBe(false);
        expect(line.failures.length).toBe(0);
        expect(systemUnderTest.symbolTable.use("A_LABEL")).toEqual(numberBag(10));
    }
});

Deno.test("Labels can only be redefined if their value doesn't change", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));
    [1, 2].forEach((_try) => {
        const sameAddress = systemUnderTest.programMemory.origin(10);
        expect(sameAddress.type).not.toBe("failures");

        const line = dummyLine(false, 1);
        line.label = "A_LABEL";
        systemUnderTest.programMemory.lineLabel(line);
        expect(line.failed()).toBe(false);
        expect(systemUnderTest.symbolTable.use("A_LABEL")).toEqual(numberBag(10));
    });
    const differentAddress = systemUnderTest.programMemory.origin(20);
    expect(differentAddress.type).not.toBe("failures");

    const line = dummyLine(false, 1);
    line.label = "A_LABEL";
    systemUnderTest.programMemory.lineLabel(line);
    expect(line.failed()).toBe(true);
    expect(systemUnderTest.symbolTable.use("A_LABEL")).toEqual(numberBag(10));
});

Deno.test("Labels are available to javascript", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));

    const line = dummyLine(false, 1);
    line.label = "A_LABEL";
    systemUnderTest.currentLine.forDirectives(line);

    const address = systemUnderTest.programMemory.origin(10);
    expect(address.type).not.toBe("failures");
    expect(line.address).toBe(10);

    systemUnderTest.programMemory.lineLabel(line);
    expect(line.failed()).toBe(false);

    const value = systemUnderTest.symbolTable.symbolValue("A_LABEL");
    expect(value).toEqual(numberBag(10));
});
