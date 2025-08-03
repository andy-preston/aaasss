import type { ClueFailure, DefinitionFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("You can choose any device that has a definition file", () => {
    for (const deviceName of ["AT-Tiny 84", "AT_Tiny 24", "AT.Tiny 44"]) {
        const systemUnderTest = testSystem();
        systemUnderTest.deviceChooser(deviceName);
        expect(systemUnderTest.currentLine().failures.length).toBe(0);
    }
});

Deno.test("Choosing multiple devices results in failure", () => {
    const firstName = "AT-Tiny 84";
    const secondName = "AT-Tiny 2313";
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().fileName = "plop.asm";
    systemUnderTest.currentLine().lineNumber = 23;
    systemUnderTest.deviceChooser(firstName);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);

    systemUnderTest.deviceChooser(secondName);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as DefinitionFailure;
    expect(failure.kind).toBe("symbol_alreadyExists");
    expect(failure.name).toBe("deviceName");
    expect(failure.definition).toBe("plop.asm:23");
});

Deno.test("Choosing the same device by different names is also a failure", () => {
    // If we think about conditional assembly - having multiple names
    // IN THE SOURCE for the same device is just plain confusing.
    const firstName = "AT-Tiny 84";
    const secondName = "at tiny 84";
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().fileName = "plop.asm";
    systemUnderTest.currentLine().lineNumber = 23;

    systemUnderTest.deviceChooser(firstName);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);

    systemUnderTest.deviceChooser(secondName);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as DefinitionFailure;
    expect(failure.kind).toBe("symbol_alreadyExists");
    expect(failure.name).toBe("deviceName");
    expect(failure.definition).toBe("plop.asm:23");
});

Deno.test("Choosing an non-existant device returns a Failure", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.deviceChooser("plop");
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as ClueFailure;
    expect(failure.kind).toBe("device_notFound");
    expect(failure.clue).toBe("./devices/plop.toml");
});

Deno.test("It correctly interprets the hex stings in the TOML files", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.deviceChooser("ATTiny2313");
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    const value = systemUnderTest.symbolTable.internalValue("TCCR1A");
    expect(value).toBe(0x4f);
});

Deno.test("It calls a callback in instruction-set with the value of 'reducedCore'", () => {
    let testIndicator: boolean | undefined = undefined;
    const systemUnderTest = testSystem();
    const mockCallback = (isReduced: boolean) => {
        testIndicator = isReduced;
    };
    systemUnderTest.instructionSet.reducedCore = mockCallback;
    expect(testIndicator).toBe(undefined);
    systemUnderTest.deviceChooser("ATTiny2313");
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(testIndicator).toBe(false);
});
