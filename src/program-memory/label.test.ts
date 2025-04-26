import { expect } from "jsr:@std/expect";
import { numberBag, stringBag, StringBag } from "../assembler/bags.ts";
import { directiveFunction } from "../directives/directive-function.ts";
import { systemUnderTest } from "./testing.ts";

const irrelevantName = "testing";

Deno.test("A label is stored in the symbol table with the current address", () => {
    const system = systemUnderTest(
        {"label": "A_LABEL", "pokes": [], "code": []}
    );
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));
    expect(origin(10).type).not.toBe("failures");
    const result = system.assemblyPipeline.next().value!;
    expect(result.failed(), "Unexpected failure").toBeFalsy();
    expect(result.failures.length).toBe(0);
    expect(system.symbolTable.use("A_LABEL")).toEqual(numberBag(10));
});

Deno.test("Labels can only be redefined if their value doesn't change", () => {
    const system = systemUnderTest(
        {"label": "A_LABEL", "pokes": [], "code": []},
        {"label": "A_LABEL", "pokes": [], "code": []},
        {"label": "A_LABEL", "pokes": [], "code": []}
    );
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));

    expect(origin(10).type).not.toBe("failures");
    const initialValue = system.assemblyPipeline.next().value!;
    expect(initialValue.failed()).toBeFalsy();
    expect(system.symbolTable.use("A_LABEL")).toEqual(numberBag(10));

    expect(origin(10).type).not.toBe("failures");
    const sameValue = system.assemblyPipeline.next().value!;
    expect(sameValue.failed()).toBeFalsy();
    expect(system.symbolTable.use("A_LABEL")).toEqual(numberBag(10));

    expect(origin(20).type).not.toBe("failures");
    const differentValues = system.assemblyPipeline.next().value!;
    expect(differentValues.failed()).toBeTruthy();
    expect(system.symbolTable.use("A_LABEL")).toEqual(numberBag(10));
});

Deno.test("Labels are available to javascript", () => {
    const system = systemUnderTest(
        {"label": "A_LABEL", "pokes": [], "code": []}
    );
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));

    expect(origin(10).type).not.toBe("failures");
    const line = system.assemblyPipeline.next().value!;
    expect(line.failed()).toBeFalsy();

    const value = system.jsExpression("A_LABEL");
    expect(value.type).not.toBe("failures");
    expect((value as StringBag).it).toBe("10");
});
