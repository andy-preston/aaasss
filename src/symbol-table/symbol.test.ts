import { assertEquals } from "assert/equals";
import { pass } from "../assembler/pass.ts";
import { directiveList } from "../directives/directive-list.ts";
import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { symbolTable } from "./symbol-table.ts";
import { deviceProperties } from "../device/properties.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";

export const testEnvironment = () => {
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
    const environment = testEnvironment();
    assertSuccess(environment.define("plop", 57), undefined);
    assertEquals(environment.symbolTable.use("plop"), 57);
});

Deno.test("A symbol can only be redefined if it's value has not changed", () => {
    const environment = testEnvironment();
    assertSuccess(environment.define("plop", 57), undefined);
    assertEquals(environment.symbolTable.use("plop"), 57);
    environment.pass.second();
    assertSuccess(environment.define("plop", 57), undefined);
    assertFailure(environment.define("plop", 75), "symbol_alreadyExists");
});

Deno.test("A symbol can't be defined with the same name as a directive", () => {
    const environment = testEnvironment();
    environment.directiveList.includes(
        // Just using the define directive because "it's handy"
        "test", environment.symbolTable.defineDirective
    );
    const result = environment.define("test", 57);
    assertFailure(result, "symbol_nameIsDirective");
});

Deno.test("A symbol is returned but not counted if it's a directive", () => {
    const environment = testEnvironment();
    environment.directiveList.includes(
        // Just using the define directive because "it's handy"
        "test", environment.symbolTable.defineDirective
    );
    const result1 = environment.symbolTable.use("test");
    assertEquals(result1, environment.symbolTable.defineDirective);
    assertEquals(environment.symbolTable.count("test"), 0);
});

Deno.test("A symbol can't be defined with the same name as a device property", () => {
    const environment = testEnvironment();
    environment.deviceProperties.property("test", 57);
    const result = environment.define("test", 57);
    assertFailure(result, "symbol_alreadyExists");
})

Deno.test("A symbol is returned and counted if it's a device property", () => {
    const environment = testEnvironment();
    environment.deviceProperties.property("test", 57);
    const result = environment.symbolTable.use("test");
    assertEquals(result, 57);
    assertEquals(environment.symbolTable.count("test"), 1);
    environment.symbolTable.use("test");
    assertEquals(environment.symbolTable.count("test"), 2);
});

Deno.test("Device properties don't 'become' symbols until they're used", () => {
    const environment = testEnvironment();
    environment.deviceProperties.property("test", 57);
    assertEquals(environment.symbolTable.count("test"), 0);
});

Deno.test("A symbol is returned and counted if it's a CPU register", () => {
    const environment = testEnvironment();
    environment.cpuRegisters.initialise(false);
    const result = environment.symbolTable.use("R15");
    assertEquals(result, 15);
    assertEquals(environment.symbolTable.count("R15"), 1);
    environment.symbolTable.use("R15");
    assertEquals(environment.symbolTable.count("R15"), 2);
});

Deno.test("CPU registers don't 'become' symbols until they're used", () => {
    const environment = testEnvironment();
    environment.cpuRegisters.initialise(false);
    assertEquals(environment.symbolTable.count("R15"), 0);
});
