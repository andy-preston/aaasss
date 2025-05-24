import type { Failure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { numberBag, stringBag } from "../assembler/bags.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("A symbol can be defined and accessed", () => {
    const system = systemUnderTest();
    const define = system.symbolTable.persistentSymbol(
        "plop", numberBag(57)
    );
    expect(define.type).not.toBe("failures");
    expect(system.symbolTable.use("plop")).toEqual(numberBag(57));
});

Deno.test("A symbol can only be redefined if it's value has not changed", () => {
    const system = systemUnderTest();
    {
        const define = system.symbolTable.persistentSymbol(
            "plop", numberBag(57)
        );
        expect(define.type).not.toBe("failures");
        const result = system.symbolTable.use("plop");
        expect(result.type).toBe("number");
        expect(result.it).toBe(57);
    } {
        const define = system.symbolTable.persistentSymbol(
            "plop", numberBag(57)
        );
        expect(define.type).not.toBe("failures");
        const result = system.symbolTable.persistentSymbol(
            "plop", numberBag(75)
        );
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
