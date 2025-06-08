import type { DefinitionFailure, Failure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { emptyBag, numberBag } from "../assembler/bags.ts";
import { testSystem } from "./testing.ts";

Deno.test("A symbol can't be defined with the same name as a device property", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.deviceSymbol(
        "redefineMe", numberBag(57)
    );
    const result = systemUnderTest.symbolTable.persistentSymbol(
        "redefineMe", numberBag(418)
    );
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as DefinitionFailure;
    expect(failure.kind).toBe("symbol_alreadyExists");
    expect(failure.name).toBe("redefineMe");
    expect(failure.definition).toBe("BUILT_IN");
});

Deno.test("A symbol can't be defined with the same name as a register", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.cpuRegisters.initialise(false);
    const result = systemUnderTest.symbolTable.persistentSymbol(
        "R8", numberBag(8)
    );
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as DefinitionFailure;
    expect(failure.kind).toBe("symbol_alreadyExists");
    expect(failure.name).toBe("R8");
    expect(failure.definition).toBe("REGISTER");
});

Deno.test("A symbol can't be defined with the same name as a built-in symbol", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.builtInSymbol("redefineMe", emptyBag());
    const result = systemUnderTest.symbolTable.persistentSymbol(
        "redefineMe", numberBag(57)
    );
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as DefinitionFailure;
    expect(failure.kind).toBe("symbol_alreadyExists");
    expect(failure.name).toBe("redefineMe");
    expect(failure.definition).toBe("BUILT_IN");
});
