import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("A symbol can't be defined with the same name as a device property", () => {
    const systemUnderTest = testSystem();

    systemUnderTest.currentLine().fileName = "plop.asm";
    systemUnderTest.currentLine().lineNumber = 23;
    systemUnderTest.symbolTable.deviceSymbol("redefineMe", 57);
    expect(systemUnderTest.currentLine().failures()).toEqual([]);

    systemUnderTest.symbolTable.persistentSymbol("redefineMe", 418);
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "symbol_alreadyExists", "location": undefined,
        "name": "redefineMe", "definition": "plop.asm:23"
    }]);
});

Deno.test("A symbol can't be defined with the same name as a register", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.cpuRegisters.initialise(false);
    systemUnderTest.symbolTable.persistentSymbol("R8", 8);
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "symbol_alreadyExists", "location": undefined,
        "name": "R8", "definition": "REGISTER"
    }]);
});

Deno.test("A symbol can't be defined with the same name as a built-in symbol", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.builtInSymbol("redefineMe", "");
    systemUnderTest.symbolTable.persistentSymbol("redefineMe", 57);
    expect(systemUnderTest.currentLine().failures()).toEqual([{
        "kind": "symbol_alreadyExists", "location": undefined,
        "name": "redefineMe", "definition": "BUILT_IN"
    }]);
});
