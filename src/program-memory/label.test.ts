import { expect } from "jsr:@std/expect";
import { numberBag, stringBag, StringBag } from "../assembler/bags.ts";
import { directiveFunction } from "../directives/directive-function.ts";
import { systemUnderTest, testLine } from "./testing.ts";

const irrelevantName = "testing";

Deno.test("A label is stored in the symbol table with the current address", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );

    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));
    expect(origin(10).type).not.toBe("failures");

    const line = testLine("A_LABEL", [], []);
    const second = system.programMemory.addressed(line);
    expect(second.failed(), "Unexpected failure").toBeFalsy();
    expect(second.failures.length).toBe(0);
    expect(system.symbolTable.use("A_LABEL")).toEqual(numberBag(10));
});

Deno.test("Labels can only be redefined if their value doesn't change", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );

    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));
    const line = testLine("A_LABEL", [], []);

    expect(origin(10).type).not.toBe("failures");
    system.programMemory.addressed(line);

    system.pass.second();
    expect(origin(10).type).not.toBe("failures");
    expect(system.programMemory.addressed(line).failed()).toBeFalsy();
    expect(system.symbolTable.use("A_LABEL")).toEqual(numberBag(10));

    expect(origin(20).type).not.toBe("failures");
    expect(system.programMemory.addressed(line).failed()).toBeTruthy();
    expect(system.symbolTable.use("A_LABEL")).toEqual(numberBag(10));
});

Deno.test("Labels are available to javascript", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );

    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));

    system.pass.second();
    expect(origin(10).type).not.toBe("failures");
    system.programMemory.addressed(testLine("A_LABEL", [], []));
    const result = system.jsExpression("A_LABEL");
    expect(result.type).not.toBe("failures");
    expect((result as StringBag).it).toBe("10");
});
