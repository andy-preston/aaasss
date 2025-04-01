import { expect } from "jsr:@std/expect";
import { emptyBag, numberBag, StringBag, stringBag } from "../assembler/bags.ts";
import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import type { VoidDirective } from "../directives/bags.ts";
import { directiveFunction } from "../directives/directive-function.ts";
import { directiveList } from "../directives/directive-list.ts";
import type { Failure } from "../failure/bags.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "./symbol-table.ts";

const irrelevantName = "testing";

export const systemUnderTest = () => {
    const currentPass = pass();
    const directives = directiveList();
    const device = deviceProperties();
    const registers = cpuRegisters();
    const symbols = symbolTable(
        directives, device.public, registers, currentPass
    );
    currentPass.resetStateCallback(symbols.resetState);
    return {
        "symbolTable": symbols,
        "directiveList": directives,
        "deviceProperties": device,
        "cpuRegisters": registers,
        "pass": currentPass
    };
};

Deno.test("A symbol can be defined and accessed", () => {
    const system = systemUnderTest();
    const define = directiveFunction(
        irrelevantName, system.symbolTable.defineDirective
    );

    expect(define("plop", 57).type).not.toBe("failures");
    expect(system.symbolTable.use("plop")).toEqual(numberBag(57));
});

Deno.test("A symbol can only be redefined if it's value has not changed", () => {
    const system = systemUnderTest();
    const define = directiveFunction(
        irrelevantName, system.symbolTable.defineDirective
    );
    {
        const definition = define("plop", 57);
        expect(definition.type).not.toBe("failures");
        const result = system.symbolTable.use("plop");
        expect(result.type).toBe("number");
        expect(result.it).toBe(57);
    } {
        system.pass.second();
        const definition = define("plop", 57);
        expect(definition.type).not.toBe("failures");
        const result = define("plop", 75);
        expect(result.type).toBe("failures");
        const failures = result.it as Array<Failure>;
        expect(failures.length).toBe(1);
        const failure = failures[0]!;
        expect(failure.kind).toBe("symbol_alreadyExists");
    }
});

Deno.test("A symbol can't be defined with the same name as a directive", () => {
    const system = systemUnderTest();
    const define = directiveFunction(
        irrelevantName, system.symbolTable.defineDirective
    );

    system.directiveList.includes("redefineMe", {
        "type": "voidDirective", "it": () => emptyBag()
    });
    const result = define("redefineMe", 57);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("symbol_alreadyExists");
});

Deno.test("A symbol is returned but not counted if it's a directive", () => {
    const system = systemUnderTest();

    const fakeDirective: VoidDirective = {
        "type": "voidDirective", "it": () => emptyBag()
    };
    system.directiveList.includes("findMe", fakeDirective);
    expect(system.symbolTable.use("findMe")).toEqual(fakeDirective);
    expect(system.symbolTable.count("findMe")).toBe(0);
});

Deno.test("A symbol can't be defined with the same name as a register", () => {
    const system = systemUnderTest();
    const define = directiveFunction(
        irrelevantName, system.symbolTable.defineDirective
    );

    system.cpuRegisters.initialise(false);
    const result = define("R8", 8);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("symbol_alreadyExists");
});

Deno.test("A symbol is returned and counted if it's a register", () => {
    const system = systemUnderTest();
    system.cpuRegisters.initialise(false);

    for (const expectedCount of [1, 2, 3]) {
        expect(system.symbolTable.use("R3")).toEqual(numberBag(3));
        expect(system.symbolTable.count("R3")).toBe(expectedCount);
    }
});

Deno.test("A symbol can't be defined with the same name as a device property", () => {
    const system = systemUnderTest();
    const define = directiveFunction(irrelevantName, system.symbolTable.defineDirective);

    system.deviceProperties.property("test", "57");
    const result = define("test", 418);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]!;
    expect(failure.kind).toBe("symbol_alreadyExists");
})

Deno.test("A symbol is returned and counted if it's a device property", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "someDevice");
    system.deviceProperties.property("test", "57");

    const result = system.deviceProperties.public.value("test");
    expect(result.type).not.toBe("failures");
    expect((result as StringBag).it).toBe("57");
    for (const expectedCount of [1, 2, 3]) {
        expect(system.symbolTable.use("test")).toEqual(stringBag("57"));
        expect(system.symbolTable.count("test")).toBe(expectedCount);
    }
});

Deno.test("Device properties don't 'become' symbols until they're used", () => {
    const system = systemUnderTest();

    system.deviceProperties.property("test", "57");
    expect(system.symbolTable.count("test")).toBe(0);
});

Deno.test("A symbol is returned and counted if it's a CPU register", () => {
    const system = systemUnderTest();
    system.cpuRegisters.initialise(false);

    for (const expectedCount of [1, 2, 3]) {
        expect(system.symbolTable.use("R15")).toEqual(numberBag(15));
        expect(system.symbolTable.count("R15")).toBe(expectedCount);
    }
});

Deno.test("CPU registers don't 'become' symbols until they're used", () => {
    const system = systemUnderTest();
    system.cpuRegisters.initialise(false);
    expect(system.symbolTable.count("R15")).toBe(0);
});
