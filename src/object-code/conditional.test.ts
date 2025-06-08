import { expect } from "jsr:@std/expect";
import { numberBag, stringBag } from "../assembler/bags.ts";
import { dummyLine } from "../line/line-types.ts";
import { testSystem } from "./testing.ts";

Deno.test("By default, code is generated", () => {
    const system = testSystem();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0x10));

    system.line.mnemonic = "SLEEP";
    system.objectCode.line(system.line);
    expect(system.line.failed()).toBe(false);
    expect(system.line.code.length).toBe(1);
});

Deno.test("The assembleIf directive can turn code generation off", () => {
    const system = testSystem();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0x10));

    system.line.mnemonic = "SLEEP";
    system.objectCode.assembleIf(false);
    system.objectCode.line(system.line);
    expect(system.line.failed()).toBe(false);
    expect(system.line.code.length).toBe(0);
});

Deno.test("The assembleIf directive can turn code generation back on", () => {
    const system = testSystem();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0x10));

    const lineWithoutCode = dummyLine(false, 1);
    lineWithoutCode.mnemonic = "SLEEP";
    system.objectCode.assembleIf(false);
    system.objectCode.line(lineWithoutCode);
    expect(lineWithoutCode.failed()).toBe(false);
    expect(lineWithoutCode.code.length).toBe(0);

    const lineWithCode = dummyLine(false, 1);
    lineWithCode.mnemonic = "SLEEP";
    system.objectCode.assembleIf(true);
    system.objectCode.line(lineWithCode);
    expect(lineWithCode.failed()).toBe(false);
    expect(lineWithCode.code.length).toBe(1);
});
