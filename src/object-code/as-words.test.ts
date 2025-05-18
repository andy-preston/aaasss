import { expect } from "jsr:@std/expect";
import { objectCode } from "./object-code.ts";
import { instructionSet } from "../device/instruction-set.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { currentLine } from "../line/current-line.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { programMemory } from "../program-memory/program-memory.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { ImmutableLine } from "../line/line-types.ts";

const systemUnderTest = () => {
    const $cpuRegisters = cpuRegisters();
    const $currentLine = currentLine();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $instructionSet = instructionSet($symbolTable);
    const $programMemory = programMemory($currentLine, $symbolTable);
    const $objectCode = objectCode($instructionSet, $programMemory);
    const line = lineWithRawSource("", 0, "", "", 0, false) as ImmutableLine;
    return {
        "objectCode": $objectCode,
        "line": line
    };
};

Deno.test("code is chunked into byte pairs", () => {
    const system = systemUnderTest();
    system.objectCode.toLine(system.line, [1, 2, 3, 4]);
    expect(system.line.code.length).toBe(2);
    expect(system.line.code[0]).toEqual([1, 2]);
    expect(system.line.code[1]).toEqual([3, 4]);
});

Deno.test("an odd number of bytes is zero padded", () => {
    const system = systemUnderTest();
    system.objectCode.toLine(system.line, [1, 2, 3, 4, 5]);
    expect(system.line.code.length).toBe(3);
    expect(system.line.code[0]).toEqual([1, 2]);
    expect(system.line.code[1]).toEqual([3, 4]);
    expect(system.line.code[2]).toEqual([5, 0]);
});
