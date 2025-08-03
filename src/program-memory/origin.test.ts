import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("A device must be selected before program memory can be set", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.programMemory.origin(10);
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "device_notSelected",  "location": undefined
    }, {
        "kind": "programMemory_sizeUnknown", "location": {"parameter": 1}
    }]);
});

Deno.test("Origin addresses can't be less than zero", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.programMemory.origin(-1);
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "type_positive", "location": {"parameter": 1},
        "value": -1, "min": 0, "max": undefined, "allowed": ""
    }]);
});

Deno.test("Device name is used to determine if properties have been set", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 0xff);
    systemUnderTest.programMemory.origin(10);
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "device_notSelected", "location": undefined
    }, {
        "kind": "programMemory_sizeUnknown", "location": {"parameter": 1}
    }]);
});

Deno.test("Origin addresses must be progmem size when a device is chosen", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    const wordsAvailable = 100;
    systemUnderTest.symbolTable.deviceSymbol(
        "programMemoryBytes", wordsAvailable * 2
    );
    const tryOrigin = 110;
    systemUnderTest.programMemory.origin(tryOrigin);
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "programMemory_outOfRange", "location": {"parameter": 1},
        "expected": `${wordsAvailable}`, "actual": `${tryOrigin}`
    }]);
});

Deno.test("Origin directive sets current address", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol("deviceName", "plop");
    systemUnderTest.symbolTable.deviceSymbol("programMemoryBytes", 0xff);
    systemUnderTest.programMemory.origin(23);
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.programMemory.address()).toBe(23);
    systemUnderTest.programMemory.origin(42);
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
    expect(systemUnderTest.programMemory.address()).toBe(42);
});

Deno.test("Origin is blocked by code in current line", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().code.push([0, 0]);
    systemUnderTest.programMemory.origin(0);
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "programMemory_cantOrg", "location": undefined
    }]);
});

Deno.test("Origin is not blocked when there's no code in current line", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.programMemory.origin(0);
    expect(systemUnderTest.currentLine().failures()).toEqual([]);
});
