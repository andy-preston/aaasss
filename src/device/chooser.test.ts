import type { ClueFailure, DefinitionFailure, Failure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { line } from "../line/line-types.ts";
import { systemUnderTest } from "./testing.ts";

const mockDefiningLine = (fileName: string, lineNumber: number) =>
    line(fileName, lineNumber, "", "", 0, false, false);

Deno.test("You can choose any device that has a definition file", () => {
    for (const deviceName of ["AT-Tiny 84", "AT_Tiny 24", "AT.Tiny 44"]) {
        const system = systemUnderTest();
        const result = system.deviceChooser(deviceName);
        expect(result.type).not.toBe("failures");
        expect(result.it).toBe("");
    }
});

Deno.test("Choosing multiple devices results in failure", () => {
    const firstName = "AT-Tiny 84";
    const secondName = "AT-Tiny 2313";
    const system = systemUnderTest();
    system.currentLine.forDirectives(mockDefiningLine("plop.asm", 23));
    {
        const result = system.deviceChooser(firstName);
        expect(result.type).not.toBe("failures");
    } {
        const result = system.deviceChooser(secondName);
        expect(result.type).toBe("failures");
        const failures = result.it as Array<Failure>;
        expect(failures.length).toBe(1);
        expect(failures[0]!.kind).toBe("symbol_alreadyExists");
        const failure = failures[0] as DefinitionFailure;
        expect(failure.name).toBe("deviceName");
        expect(failure.definition).toBe("plop.asm:23");
    }
});

Deno.test("Choosing the same device by different names is also a failure", () => {
    // If we think about conditional assembly - having multiple names
    // IN THE SOURCE for the same device is just plain confusing.
    const firstName = "AT-Tiny 84";
    const secondName = "at tiny 84";
    const system = systemUnderTest();
    system.currentLine.forDirectives(mockDefiningLine("plop.asm", 23));
    {
        const result = system.deviceChooser(firstName);
        expect(result.type).not.toBe("failures");
    } {
        const result = system.deviceChooser(secondName);
        expect(result.type, "failures");
        const failures = result.it as Array<Failure>;
        expect(failures.length).toBe(1);
        expect(failures[0]!.kind).toBe("symbol_alreadyExists");
        const failure = failures[0] as DefinitionFailure;
        expect(failure.name).toBe("deviceName");
        expect(failure.definition).toBe("plop.asm:23");
    }
});

Deno.test("Choosing an non-existant device returns a Failure", () => {
    const system = systemUnderTest();
    const result = system.deviceChooser("plop");
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as ClueFailure;
    expect(failure.kind).toBe("device_notFound");
    expect(failure.clue).toBe("./devices/plop.toml");
});

Deno.test("It correctly interprets the hex stings in the TOML files", () => {
    const system = systemUnderTest();
    const result = system.deviceChooser("ATTiny2313");
    expect(result.type).not.toBe("failures");
    expect(result.it).toBe("");
    const value = system.symbolTable.symbolValue("TCCR1A");
    expect(value.type).toBe("number");
    expect(value.it).toBe(0x4f);
});

Deno.test("It calls a callback in instruction-set with the value of 'reducedCore'", () => {
    let testIndicator: boolean | undefined = undefined;
    const system = systemUnderTest();
    const mockCallback = (isReduced: boolean) => {
        testIndicator = isReduced;
    };
    system.instructionSet.reducedCore = mockCallback;
    expect(testIndicator).toBe(undefined);
    const result = system.deviceChooser("ATTiny2313");
    expect(result.type).not.toBe("failures");
    expect(result.it).toBe("");
    expect(testIndicator).toBe(false);
});
