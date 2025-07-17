import { expect } from "jsr:@std/expect/expect";
import { testSystem } from "./testing.ts";

Deno.test("You can poke bytes", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 20);
    systemUnderTest.objectCode.poke(1, 2, 3, 4);
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(systemUnderTest.currentLine().code).toEqual([[1, 2], [3, 4]]);
});

Deno.test("Poked bytes are grouped in sets of 2", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 20);
    systemUnderTest.objectCode.poke(1, 2, 3, 4, 5, 6);
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(systemUnderTest.currentLine().code).toEqual([[1, 2], [3, 4], [5, 6]]);
});

Deno.test("Poked bytes are padded to an even number", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 20);

    systemUnderTest.objectCode.poke(1, 2, 3);
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(systemUnderTest.currentLine().code).toEqual([[1, 2], [3, 0]]);

    systemUnderTest.objectCode.poke(1, 2, 3, 4, 5);
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(systemUnderTest.currentLine().code).toEqual([
        [1, 2], [3, 0],
        [1, 2], [3, 4], [5, 0]
    ]);
});

Deno.test("You can also poke ASCII strings", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 20);
    systemUnderTest.objectCode.poke("Hello");
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(systemUnderTest.currentLine().code).toEqual([
        [72, 101], [108, 108], [111, 0]
    ]);
});

Deno.test("... or UTF-8 strings", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 20);
    systemUnderTest.objectCode.poke("ਕਿੱਦਾਂ");
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(systemUnderTest.currentLine().code).toEqual([
        [224, 168], [149, 224], [168, 191], [224, 169],
        [177, 224], [168, 166], [224, 168], [190, 224], [168, 130]
    ]);
});

Deno.test("... or a combination of bytes and strings", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 20);
    systemUnderTest.objectCode.poke(1, 2, 3, 4, "Hello");
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(systemUnderTest.currentLine().code).toEqual([
        [1, 2], [3, 4], [72, 101], [108, 108], [111, 0]
    ]);
})

Deno.test("Poked numbers must be bytes (0-255)", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 20);
    systemUnderTest.objectCode.poke(-1, 2, 300, 4);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "value_type", "location": {"parameter": 1},
        "expected": "string, byte", "actual": "number: (-1)"
    }, {
        "kind": "value_type", "location": {"parameter": 3},
        "expected": "string, byte", "actual": "number: (300)"
    }]);
    expect(systemUnderTest.currentLine().code).toEqual([[0, 2], [0, 4]]);
});

Deno.test("A poke can't have boolean parameters", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 20);
    systemUnderTest.objectCode.poke(false, true);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "value_type", "location": {"parameter": 1},
        "expected": "string, byte", "actual": "boolean: (false)"
    }, {
        "kind": "value_type", "location": {"parameter": 2},
        "expected": "string, byte", "actual": "boolean: (true)"
    }]);
});

Deno.test("A poke can't have object or array parameters", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 20);
    systemUnderTest.objectCode.poke({}, []);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "value_type", "location": {"parameter": 1},
        "expected": "string, byte", "actual": "object: ([object Object])",
    }, {
        "kind": "value_type", "location": {"parameter": 2},
        "expected": "string, byte", "actual": "array: ()"
    }]);
});

Deno.test("A poke can have any number of string or NUMERIC parameters", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 20);
    systemUnderTest.objectCode.poke("hello", 2, 3, "goodbye");
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(systemUnderTest.currentLine().code).toEqual([
        [0x68, 0x65], [0x6c, 0x6c], [0x6f,  0x2],
        [ 0x3, 0x67], [0x6f, 0x6f], [0x64, 0x62], [0x79, 0x65]
    ]);
});

Deno.test("Poking will increment the programMemory address", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 20);
    expect(systemUnderTest.programMemory.address()).toBe(0);
    systemUnderTest.objectCode.poke(1, 2, 3, 4);
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(systemUnderTest.programMemory.address()).toBe(2);
});

Deno.test("Insufficient program memory causes poking to fail", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 0x00);
    const preFailureAddress = systemUnderTest.programMemory.address();
    const testData = [1, 2, 3, 4];
    systemUnderTest.objectCode.poke(...testData);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "programMemory_outOfRange", "location": undefined,
        "expected": "0", "actual": "2"
    }]);
    // Code is still generated
    expect(systemUnderTest.currentLine().code).toEqual([[1, 2], [3, 4]]);
    // But the address doesn't advance
    expect(systemUnderTest.programMemory.address()).toBe(preFailureAddress);
});
