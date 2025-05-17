import { expect } from "jsr:@std/expect";
import { numberBag, stringBag, StringBag } from "../assembler/bags.ts";
import { systemUnderTest, testPipeline } from "./testing.ts";

Deno.test("A label is stored in the symbol table with the current address", () => {
    const system = systemUnderTest();
    const pipeline = testPipeline(
        system, {"label": "A_LABEL", "code": []}
    );
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));
    const origin = system.programMemory.origin(10);
    expect(origin.type).not.toBe("failures");
    const result = pipeline.next().value!;
    expect(result.failed(), "Unexpected failure").toBeFalsy();
    expect(result.failures.length).toBe(0);
    expect(system.symbolTable.use("A_LABEL")).toEqual(numberBag(10));
});

Deno.test("Labels can only be redefined if their value doesn't change", () => {
    const system = systemUnderTest();
    const pipeline = testPipeline(
        system,
        {"label": "A_LABEL", "code": []},
        {"label": "A_LABEL", "code": []},
        {"label": "A_LABEL", "code": []}
    );
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));
    {
        const origin = system.programMemory.origin(10);
        expect(origin.type).not.toBe("failures");
    }
    const initialValue = pipeline.next().value!;
    expect(initialValue.failed()).toBeFalsy();
    expect(system.symbolTable.use("A_LABEL")).toEqual(numberBag(10));
    {
        const origin = system.programMemory.origin(10);
        expect(origin.type).not.toBe("failures");
    }
    const sameValue = pipeline.next().value!;
    expect(sameValue.failed()).toBeFalsy();
    expect(system.symbolTable.use("A_LABEL")).toEqual(numberBag(10));
    {
        const origin = system.programMemory.origin(20);
        expect(origin.type).not.toBe("failures");
    }
    const differentValues = pipeline.next().value!;
    expect(differentValues.failed()).toBeTruthy();
    expect(system.symbolTable.use("A_LABEL")).toEqual(numberBag(10));
});

Deno.test("Labels are available to javascript", () => {
    const system = systemUnderTest();
    const pipeline = testPipeline(
        system, {"label": "A_LABEL", "code": []}
    );
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));

    const origin = system.programMemory.origin(10);
    expect(origin.type).not.toBe("failures");
    const line = pipeline.next().value!;
    expect(line.failed()).toBeFalsy();

    const value = system.jsExpression("A_LABEL");
    expect(value.type).not.toBe("failures");
    expect((value as StringBag).it).toBe("10");
});
