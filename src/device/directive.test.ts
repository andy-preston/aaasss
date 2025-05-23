import type { AssertionFailure, ClueFailure, DefinitionFailure, Failure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { directiveFunction } from "../directives/directive-function.ts";
import { line } from "../line/line-types.ts";
import { systemUnderTest } from "./testing.ts";

const mockDefiningLine = (fileName: string, lineNumber: number) =>
    line(fileName, lineNumber, "", "", 0, false);

Deno.test("You can choose any device that has a definition file", () => {
    for (const deviceName of ["AT-Tiny 84", "AT_Tiny 24", "AT.Tiny 44"]) {
        const system = systemUnderTest();
        const result = system.deviceDirective.it(deviceName);
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
        const result = system.deviceDirective.it(firstName);
        expect(result.type).not.toBe("failures");
    } {
        const result = system.deviceDirective.it(secondName);
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
        const result = system.deviceDirective.it(firstName);
        expect(result.type).not.toBe("failures");
    } {
        const result = system.deviceDirective.it(secondName);
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
    const result = system.deviceDirective.it("notARealDevice");
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as ClueFailure;
    expect(failure.kind).toBe("device_notFound");
    // cSpell:words notarealdevice
    expect(failure.clue).toBe("./devices/notarealdevice.toml");
});

Deno.test("The device name must be present", () => {
    const system = systemUnderTest();
    const device = directiveFunction("device", system.deviceDirective);
    const result = device();
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("parameter_count");
    const failure = failures[0] as AssertionFailure;
    expect(failure.expected).toBe("1");
    expect(failure.actual).toBe("0");
});

Deno.test("The device name must be present and a string", () => {
    const system = systemUnderTest();
    const device = directiveFunction("device", system.deviceDirective);
    const result = device("at tiny 24");
    expect(result.type).not.toBe("failures");
    expect(result.it).toBe("");
});

Deno.test("It correctly interprets the hex stings in the TOML files", () => {
    const system = systemUnderTest();
    const result = system.deviceDirective.it("ATTiny2313");
    expect(result.type).not.toBe("failures");
    expect(result.it).toBe("");
    const value = system.symbolTable.symbolValue("TCCR1A");
    expect(value.type).toBe("number");
    expect(value.it).toBe(0x4f);
});
