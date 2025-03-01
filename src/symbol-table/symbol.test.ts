import { assertEquals } from "assert/equals";
import { pass } from "../assembler/pass.ts";
import { directiveList } from "../directives/directive-list.ts";
import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { symbolTable } from "./symbol-table.ts";
import { deviceProperties } from "../device/properties.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";

export const systemUnderTest = () => {
    const currentPass = pass();
    const directives = directiveList();
    const device = deviceProperties();
    const registers = cpuRegisters();
    const symbols = symbolTable(
        directives, device.public, registers, currentPass
    );
    return {
        "define": symbols.defineDirective,
        "symbolTable": symbols,
        "directiveList": directives,
        "deviceProperties": device,
        "cpuRegisters": registers,
        "pass": currentPass
    };
};

Deno.test("A symbol can be defined and accessed", () => {
    const system = systemUnderTest();
    assertSuccess(system.define("plop", 57), undefined);
    assertEquals(system.symbolTable.use("plop"), {
        "type": "number", "value": 57
    });
});

Deno.test("A symbol can only be redefined if it's value has not changed", () => {
    const system = systemUnderTest();
    assertSuccess(system.define("plop", 57), undefined);
    assertEquals(system.symbolTable.use("plop"), {
        "type": "number", "value": 57
    });
    system.pass.second();
    assertSuccess(system.define("plop", 57), undefined);
    assertFailure(system.define("plop", 75), "symbol_alreadyExists");
});

Deno.test("A symbol can't be defined with the same name as a directive", () => {
    const system = systemUnderTest();
    system.directiveList.includes(
        // Just using the define directive because "it's handy"
        "test", system.symbolTable.defineDirective
    );
    const result = system.define("test", 57);
    assertFailure(result, "symbol_nameIsDirective");
});

Deno.test("A symbol is returned but not counted if it's a directive", () => {
    const system = systemUnderTest();
    system.directiveList.includes(
        // Just using the define directive because "it's handy"
        "test", system.symbolTable.defineDirective
    );
    const result1 = system.symbolTable.use("test");
    assertEquals(result1, {
        "type": "function", "value": system.symbolTable.defineDirective
    });
    assertEquals(system.symbolTable.count("test"), 0);
});

Deno.test("A symbol can't be defined with the same name as a register", () => {
    const system = systemUnderTest();
    system.cpuRegisters.initialise(false);
    const result = system.define("R8", 8);
    assertFailure(result, "symbol_nameIsRegister");
});

Deno.test("A symbol is returned and counted if it's a register", () => {
    const system = systemUnderTest();
    system.cpuRegisters.initialise(false);
    for (const expectedCount of [1, 2, 3]) {
        const result = system.symbolTable.use("R3");
        assertEquals(result, {
            "type": "number", "value": 3
        });
        assertEquals(system.symbolTable.count("R3"), expectedCount);
    }
});

Deno.test("A symbol can't be defined with the same name as a device property", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("test", "57");
    const result = system.define("test", 57);
    assertFailure(result, "symbol_alreadyExists");
})

Deno.test("A symbol is returned and counted if it's a device property", () => {
    const system = systemUnderTest();
    system.deviceProperties.property("deviceName", "someDevice");
    system.deviceProperties.property("test", "57");
    assertSuccess(system.deviceProperties.public.value("test"), "57");
    for (const expectedCount of [1, 2, 3]) {
        const result = system.symbolTable.use("test");
        assertEquals(result, {
            "type": "string", "value": "57"
        });
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
        const result = system.symbolTable.use("R15");
        assertEquals(result, {
            "type": "number", "value": 15
        });
        assertEquals(system.symbolTable.count("R15"), expectedCount);
    }
});

Deno.test("CPU registers don't 'become' symbols until they're used", () => {
    const system = systemUnderTest();
    system.cpuRegisters.initialise(false);
    assertEquals(system.symbolTable.count("R15"), 0);
});
