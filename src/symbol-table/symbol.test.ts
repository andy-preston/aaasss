import { expect } from "jsr:@std/expect";
import { numberBag, stringBag } from "../assembler/bags.ts";
import { pass } from "../assembler/pass.ts";
import { directiveFunction } from "../directives/directive-function.ts";
import type { Failure } from "../failure/bags.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "./symbol-table.ts";

const irrelevantName = "testing";

export const systemUnderTest = () => {
    const currentPass = pass();
    const registers = cpuRegisters();
    const symbols = symbolTable(registers);
    currentPass.resetStateCallback(symbols.resetState);
    return {
        "symbolTable": symbols,
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

Deno.test("Getting a device property when no deviceName is present fails", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("something", numberBag(23));
    const result = system.symbolTable.deviceSymbolValue("something", "number");
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("device_notSelected");
});

Deno.test("After loading the device, it returns property values", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("imaginaryDevice"));
    system.symbolTable.deviceSymbol("PORTD", numberBag(0x3f));
    const result = system.symbolTable.deviceSymbolValue("PORTD", "number");
    expect(result.type).toBe("number");
    expect(result.it).toBe(0x3f);
});

Deno.test("Device dependent property values are type checked", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("imaginaryDevice"));
    system.symbolTable.deviceSymbol("PORTD", stringBag("nonsense"));
    expect(
        () => { system.symbolTable.deviceSymbolValue("PORTD", "number"); }
    ).toThrow<Error>(
        "Device configuration error - imaginaryDevice - PORTD - number - string"
    );
});
