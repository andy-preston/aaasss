import { expect } from "jsr:@std/expect";
import { numberBag, stringBag } from "../assembler/bags.ts";
import { dummyLine } from "../line/line-types.ts";
import { testSystem } from "./testing.ts";

Deno.test("By default, code is generated", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0x10));

    systemUnderTest.line.mnemonic = "SLEEP";
    systemUnderTest.objectCode.line(systemUnderTest.line);
    expect(systemUnderTest.line.failed()).toBe(false);
    expect(systemUnderTest.line.code.length).toBe(1);
});

Deno.test("The assembleIf directive can turn code generation off", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0x10));

    systemUnderTest.line.mnemonic = "SLEEP";
    systemUnderTest.objectCode.assembleIf(false);
    systemUnderTest.objectCode.line(systemUnderTest.line);
    expect(systemUnderTest.line.failed()).toBe(false);
    expect(systemUnderTest.line.code.length).toBe(0);
});

Deno.test("The assembleIf directive can turn code generation back on", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0x10));

    const lineWithoutCode = dummyLine(false, 1);
    lineWithoutCode.mnemonic = "SLEEP";
    systemUnderTest.objectCode.assembleIf(false);
    systemUnderTest.objectCode.line(lineWithoutCode);
    expect(lineWithoutCode.failed()).toBe(false);
    expect(lineWithoutCode.code.length).toBe(0);

    const lineWithCode = dummyLine(false, 1);
    lineWithCode.mnemonic = "SLEEP";
    systemUnderTest.objectCode.assembleIf(true);
    systemUnderTest.objectCode.line(lineWithCode);
    expect(lineWithCode.failed()).toBe(false);
    expect(lineWithCode.code.length).toBe(1);
});
