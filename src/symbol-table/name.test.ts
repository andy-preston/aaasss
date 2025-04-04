import { expect } from "jsr:@std/expect";
import { emptyBag, numberBag } from "../assembler/bags.ts";
import { directiveFunction } from "../directives/directive-function.ts";
import type { DefinitionFailure, Failure } from "../failure/bags.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "./symbol-table.ts";

const irrelevantName = "testing";

export const systemUnderTest = () => {
    const registers = cpuRegisters();
    const symbols = symbolTable(registers);
    return {
        "symbolTable": symbols,
        "cpuRegisters": registers,
    };
};

Deno.test("A symbol can't be defined with the same name as a device property", () => {
    const system = systemUnderTest();
    const define = directiveFunction(irrelevantName, system.symbolTable.defineDirective);
    system.symbolTable.deviceSymbol("redefineMe", numberBag(57));
    const result = define("redefineMe", 418);
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
    const define = directiveFunction(
        irrelevantName, system.symbolTable.defineDirective
    );
    system.cpuRegisters.initialise(false);
    const result = define("R8", 8);
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
    const define = directiveFunction(
        irrelevantName, system.symbolTable.defineDirective
    );
    system.symbolTable.builtInSymbol("redefineMe", emptyBag());
    const result = define("redefineMe", 57);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as DefinitionFailure;
    expect(failure.kind).toBe("symbol_alreadyExists");
    expect(failure.name).toBe("redefineMe");
    expect(failure.definition).toBe("BUILT_IN");
});
