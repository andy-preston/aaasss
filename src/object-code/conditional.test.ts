import { expect } from "jsr:@std/expect";
import { isFunction } from "../directives/testing.ts";
import { testSystem } from "./testing.ts";

const aSleepInstruction = [0x88, 0x95];

Deno.test("By default, code is generated", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 0x10);

    systemUnderTest.currentLine().mnemonic = "SLEEP";
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.currentLine().code).toEqual([aSleepInstruction]);
});

Deno.test("AssembleIf takes a boolean parameter", () => {
    const systemUnderTest = testSystem();
    const assembleIf = systemUnderTest.symbolTable.use("assembleIf");
    if (isFunction(assembleIf)) {
        assembleIf("plop");
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "parameter_type", "location": {"parameter": 1},
        "expected": "boolean", "actual": "string"
    }]);
});

Deno.test("AssembleIf takes a single parameter", () => {
    const systemUnderTest = testSystem();
    const assembleIf = systemUnderTest.symbolTable.use("assembleIf");
    if (isFunction(assembleIf)) {
        assembleIf(true, false);
    }
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "parameter_count", "location": undefined,
        "expected": "1", "actual": "2"
    }]);
});

Deno.test("The assembleIf directive can turn code generation off", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 0x10);
    const assembleIf = systemUnderTest.symbolTable.use("assembleIf");
    systemUnderTest.currentLine().mnemonic = "SLEEP";

    if (isFunction(assembleIf)) {
        assembleIf(false);
    }
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.currentLine().code).toEqual([]);
});

Deno.test("The assembleIf directive can turn code generation back on", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 0x10);
    const assembleIf = systemUnderTest.symbolTable.use("assembleIf");
    systemUnderTest.currentLine().mnemonic = "SLEEP";

    if (isFunction(assembleIf)) {
        assembleIf(false);
    }
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.currentLine().code).toEqual([]);

    if (isFunction(assembleIf)) {
        assembleIf(true);
    }
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.currentLine().code).toEqual([aSleepInstruction]);
});

Deno.test("assembleIf will be evaluated even if code generation is off", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 0x10);
    systemUnderTest.objectCode.assembleIf(false);

    systemUnderTest.currentLine().mnemonic = "SLEEP";
    systemUnderTest.currentLine().operands = [];
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.currentLine().code).toEqual([]);

    systemUnderTest.currentLine().mnemonic = ".";
    systemUnderTest.currentLine().operands = ["assembleIf(true)"];
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.currentLine().code).toEqual([]);

    systemUnderTest.currentLine().mnemonic = "SLEEP";
    systemUnderTest.currentLine().operands = [];
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.currentLine().code).toEqual([aSleepInstruction]);
});
