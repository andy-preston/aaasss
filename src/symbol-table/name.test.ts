import type { DefinitionFailure, Failure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { emptyBag, numberBag } from "../assembler/bags.ts";
import { systemUnderTest, testDirectives } from "./testing.ts";

Deno.test("A symbol can't be defined with the same name as a device property", () => {
    const system = systemUnderTest();
    const directives = testDirectives(system);

    system.symbolTable.deviceSymbol("redefineMe", numberBag(57));
    const result = directives.define("redefineMe", 418);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as DefinitionFailure;
    expect(failure.kind).toBe("symbol_alreadyExists");
    expect(failure.name).toBe("redefineMe");
    expect(failure.definition).toBe("BUILT_IN");
});

Deno.test("A symbol can't be defined with the same name as a register", () => {
    const system = systemUnderTest();
    const directives = testDirectives(system);

    system.cpuRegisters.initialise(false);
    const result = directives.define("R8", 8);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as DefinitionFailure;
    expect(failure.kind).toBe("symbol_alreadyExists");
    expect(failure.name).toBe("R8");
    expect(failure.definition).toBe("REGISTER");
});

Deno.test("A symbol can't be defined with the same name as a built-in symbol", () => {
    const system = systemUnderTest();
    const directives = testDirectives(system);

    system.symbolTable.builtInSymbol("redefineMe", emptyBag());
    const result = directives.define("redefineMe", 57);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as DefinitionFailure;
    expect(failure.kind).toBe("symbol_alreadyExists");
    expect(failure.name).toBe("redefineMe");
    expect(failure.definition).toBe("BUILT_IN");
});
