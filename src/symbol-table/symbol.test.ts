import { assertEquals } from "assert";
import { emptyBag, numberBag, stringBag } from "../assembler/bags.ts";
import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import type { VoidDirective } from "../directives/bags.ts";
import { directiveFunction } from "../directives/directive-function.ts";
import { directiveList } from "../directives/directive-list.ts";
import { extractedFailures } from "../failure/bags.ts";
import { assertFailureKind, assertFailures, assertSuccess, assertSuccessWith } from "../failure/testing.ts";
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

    assertSuccess(define("plop", 57));
    assertEquals(system.symbolTable.use("plop"), numberBag(57));
});

Deno.test("A symbol can only be redefined if it's value has not changed", () => {
    const system = systemUnderTest();
    const define = directiveFunction(
        irrelevantName, system.symbolTable.defineDirective
    );

    assertSuccess(define("plop", 57));
    assertEquals(system.symbolTable.use("plop"), numberBag(57));

    system.pass.second();
    assertSuccess(define("plop", 57));

    const result = define("plop", 75);
    assertFailures(result);
    assertFailureKind(extractedFailures(result), "symbol_alreadyExists");
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
    assertFailures(result);
    assertFailureKind(extractedFailures(result), "symbol_nameIsDirective");
});

Deno.test("A symbol is returned but not counted if it's a directive", () => {
    const system = systemUnderTest();

    const fakeDirective: VoidDirective = {
        "type": "voidDirective", "it": () => emptyBag()
    };
    system.directiveList.includes("findMe", fakeDirective);
    assertEquals(system.symbolTable.use("findMe"), fakeDirective);
    assertEquals(system.symbolTable.count("findMe"), 0);
});

Deno.test("A symbol can't be defined with the same name as a register", () => {
    const system = systemUnderTest();
    const define = directiveFunction(
        irrelevantName, system.symbolTable.defineDirective
    );

    system.cpuRegisters.initialise(false);
    const result = define("R8", 8);
    assertFailures(result);
    assertFailureKind(extractedFailures(result), "symbol_nameIsRegister");
});

Deno.test("A symbol is returned and counted if it's a register", () => {
    const system = systemUnderTest();
    system.cpuRegisters.initialise(false);

    for (const expectedCount of [1, 2, 3]) {
        assertEquals(system.symbolTable.use("R3"), numberBag(3));
        assertEquals(system.symbolTable.count("R3"), expectedCount);
    }
});

Deno.test("A symbol can't be defined with the same name as a device property", () => {
    const system = systemUnderTest();
    const define = directiveFunction(irrelevantName, system.symbolTable.defineDirective);

    system.deviceProperties.property("test", "57");
    const result = define("test", 57);
    assertFailures(result);
    assertFailureKind(extractedFailures(result), "symbol_alreadyExists");
})

Deno.test("A symbol is returned and counted if it's a device property", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "someDevice");

    system.deviceProperties.property("test", "57");
    assertSuccessWith(system.deviceProperties.public.value("test"), "57");
    for (const expectedCount of [1, 2, 3]) {
        assertEquals(system.symbolTable.use("test"), stringBag("57"));
        assertEquals(system.symbolTable.count("test"), expectedCount);
    }
});

Deno.test("Device properties don't 'become' symbols until they're used", () => {
    const system = systemUnderTest();

    system.deviceProperties.property("test", "57");
    assertEquals(system.symbolTable.count("test"), 0);
});

Deno.test("A symbol is returned and counted if it's a CPU register", () => {
    const system = systemUnderTest();
    system.cpuRegisters.initialise(false);

    for (const expectedCount of [1, 2, 3]) {
        assertEquals(system.symbolTable.use("R15"), numberBag(15));
        assertEquals(system.symbolTable.count("R15"), expectedCount);
    }
});

Deno.test("CPU registers don't 'become' symbols until they're used", () => {
    const system = systemUnderTest();
    system.cpuRegisters.initialise(false);

    assertEquals(system.symbolTable.count("R15"), 0);
});
