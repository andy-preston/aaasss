import type { ExceptionFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { jSExpression } from "../javascript/expression.ts";
import { currentLine } from "../line/current-line.ts";
import { dummyLine } from "../line/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { symbolicToNumeric } from "./symbolic-to-numeric.ts";

export const systemUnderTest = () => {
    const $currentLine = currentLine();
    const $line = dummyLine(false);
    $currentLine.forDirectives($line);
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $jsExpression = jSExpression($symbolTable);
    const $symbolicToNumeric = symbolicToNumeric(
        $symbolTable, $cpuRegisters, $jsExpression
    );
    return {
        "cpuRegisters": $cpuRegisters,
        "symbolTable": $symbolTable,
        "symbolicToNumeric": $symbolicToNumeric,
        "line": $line
    };
};

Deno.test("An expression yields a value", () => {
    const system = systemUnderTest();
    system.line.symbolicOperands = ["20 / 2"];
    system.symbolicToNumeric(system.line);
    expect(system.line.failed()).toBe(false);
    expect(system.line.numericOperands[0]).toBe(10);
    expect(system.line.operandTypes[0]).toBe("number");
});

Deno.test("A symbol yields a value", () => {
    const system = systemUnderTest();
    system.cpuRegisters.initialise(false);
    const useResult = system.symbolTable.use("R7");
    expect(useResult.type).toBe("number");
    expect(useResult.it).toBe(7);
    system.line.symbolicOperands = ["R7"];
    system.symbolicToNumeric(system.line);
    expect(system.line.failed()).toBe(false);
    expect(system.line.numericOperands[0]).toBe(7);
    expect(system.line.operandTypes[0]).toBe("register");
});

Deno.test("An index prefix/postfix operand gives a zero numeric value", () => {
    const system = systemUnderTest();
    system.cpuRegisters.initialise(false);
    system.line.symbolicOperands = ["X+", "+Y", "Z"];
    system.symbolicToNumeric(system.line);
    expect(system.line.failed()).toBe(false);
    system.line.operandTypes.forEach((operandType, index) => {
        const value = system.line.numericOperands[index];
        expect(operandType).toBe("index");
        expect(value).toBe(0);
    });
});

Deno.test("An uninitialised symbol yields a failure", () => {
    const system = systemUnderTest();
    system.line.symbolicOperands = ["notDefined"];
    system.symbolicToNumeric(system.line);
    expect(system.line.failed()).toBe(true);
    expect(system.line.failures.length).toBe(1);
    expect(system.line.failures[0]!.kind).toBe("js_error");
    const failure = system.line.failures[0] as ExceptionFailure;
    expect(failure.exception).toBe("ReferenceError");
    expect(failure.message).toBe("notDefined is not defined");
});
