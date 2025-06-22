import type { AssertionFailure, ClueFailure, ExceptionFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { directiveFunction } from "../directives/directives.ts";
import { currentLine } from "../line/current-line.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { programMemory } from "../program-memory/program-memory.ts";
import { jSExpression } from "../javascript/expression.ts";
import { operands } from "./operands.ts";
import { emptyLine } from "../line/line-types.ts";

const testSystem = () => {
    const $currentLine = currentLine();
    $currentLine(emptyLine("plop.asm"));
    const $cpuRegisters = cpuRegisters();
    $cpuRegisters.initialise(false);
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $directiveFunction = directiveFunction($currentLine);
    const $programMemory = programMemory($currentLine, $symbolTable);
    const $jsExpression = jSExpression(
        $currentLine, $symbolTable, $directiveFunction
    );
    const $operands = operands(
        $currentLine, $symbolTable, $cpuRegisters, $programMemory, $jsExpression
    );
    return {
        "currentLine": $currentLine,
        "operands": $operands,
        "symbolTable": $symbolTable
    };
};

Deno.test("Line must have at least the expected register operands", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["Z"];
    systemUnderTest.operands(["onlyZ", "register"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(2);
    {
        const failure =
            systemUnderTest.currentLine().failures[0] as AssertionFailure;
        expect(failure.kind).toBe("operand_count");
        expect(failure.expected).toBe("2");
        expect(failure.actual).toBe("1");
    } {
        const failure =
            systemUnderTest.currentLine().failures[1] as ClueFailure;
        expect(failure.kind).toBe("register_notFound");
        expect(failure.clue).toBe(undefined);
    }
});

Deno.test("Line must have at least the expected register operands", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["Z"];
    systemUnderTest.operands(["onlyZ", "6BitNumber"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(2);
    {
        const failure =
            systemUnderTest.currentLine().failures[0] as AssertionFailure;
        expect(failure.kind).toBe("operand_count");
        expect(failure.expected).toBe("2");
        expect(failure.actual).toBe("1");
    } {
        const failure =
            systemUnderTest.currentLine().failures[1] as AssertionFailure;
        expect(failure.kind).toBe("value_type");
        expect(failure.expected).toBe("6BitNumber");
        expect(failure.actual).toBe("string: ()");
        expect(failure.location).toEqual({"operand": 2});
    }
});

Deno.test("line must not exceed expected operands", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["R10", "R11"];
    systemUnderTest.operands(["register"]);
    const failures = systemUnderTest.currentLine().failures;
    expect(failures.length).toBe(1);
    const failure = failures[0] as AssertionFailure;
    expect(failure.kind).toBe("operand_count");
    expect(failure.expected).toBe("1");
    expect(failure.actual).toBe("2");
});

Deno.test("line and expectation types must not be different", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["R10", "R12"];
    systemUnderTest.operands(["nybble", "ioPort"]);
    const failures = systemUnderTest.currentLine().failures;
    expect(failures.length).toBe(2);
    {
        const failure = failures[0] as AssertionFailure;
        expect(failure.kind).toBe("value_type");
        expect(failure.location!).toEqual({"operand": 1});
        expect(failure.expected).toBe("nybble");
        expect(failure.actual).toBe("register: R10");
    } {
        const failure = failures[1] as AssertionFailure;
        expect(failure.kind).toBe("value_type");
        expect(failure.location!).toEqual({"operand": 2});
        expect(failure.expected).toBe("ioPort");
        expect(failure.actual).toBe("register: R12");
    }
});

Deno.test("Everything's lovely when actual and expected match", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["R10", "10 / 2"];
    const result = systemUnderTest.operands(["register", "nybble"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(result).toEqual([10, 5]);
});

Deno.test("Some operands can be optional", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = [];
    expect(systemUnderTest.operands(["optionalZ+"])).toEqual([0]);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
});

Deno.test("An expression yields a value", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["20 / 2"];
    const result = systemUnderTest.operands(["nybble"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(result).toEqual([10]);
});

Deno.test("A register symbol yields a value", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["R7"];
    const result = systemUnderTest.operands(["register"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(result).toEqual([7]);
});

Deno.test("A non-existant register symbol yields failures", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["R99"];
    const result = systemUnderTest.operands(["register"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as ClueFailure;
    expect(failure.kind).toBe("register_notFound");
    expect(failure.clue).toBe("R99");
    expect(failure.location).toEqual({"operand": 1});
    expect(result).toEqual([0]);
});

Deno.test("A register can't be used for a number", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["R7"];
    const result = systemUnderTest.operands(["6BitNumber"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as AssertionFailure;
    expect(failure.kind).toBe("value_type");
    expect(failure.actual).toBe("register: R7");
    expect(failure.expected).toBe("6BitNumber");
    expect(failure.location).toEqual({"operand": 1});
    expect(result).toEqual([0]);
});

Deno.test("A symbol can't be used as a register", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.builtInSymbol("plop", 5);
    systemUnderTest.currentLine().operands = ["plop", "plop"];
    const result = systemUnderTest.operands(["byte", "register"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as ClueFailure;
    expect(failure.kind).toBe("register_notFound");
    expect(failure.clue).toBe("plop");
    expect(failure.location).toEqual({"operand": 2});
    expect(result).toEqual([5, 0]);
});

Deno.test("'Special' operands yield a numeric value", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["Z+"];
    const result = systemUnderTest.operands(["ZorZ+"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(result).toEqual([1]);
});

Deno.test("Bad 'special' operands yield failures", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["plop"];
    const result = systemUnderTest.operands(["onlyZ"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as AssertionFailure;
    expect(failure.kind).toBe("value_type");
    expect(failure.expected).toBe("Z");
    expect(failure.actual).toBe("string: (plop)");
    expect(failure.location).toEqual({"operand": 1});
    expect(result).toEqual([0]);
});

Deno.test("Optional parameters can be absent", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = [];
    const result = systemUnderTest.operands(["optionalZ+"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(result).toEqual([0]);
});

Deno.test("... or present", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["Z+"];
    const result = systemUnderTest.operands(["optionalZ+"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(result).toEqual([1]);
});

Deno.test("Incorrect optional parameters yield a failure", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["plop"];
    const result = systemUnderTest.operands(["optionalZ+"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure = systemUnderTest.currentLine().failures[0] as AssertionFailure;
    expect(failure.kind).toBe("value_type");
    expect(failure.expected).toBe("undefined, Z+");
    expect(failure.actual).toBe("string: (plop)");
    expect(failure.location).toEqual({"operand": 1});
    expect(result).toEqual([0]);
});

Deno.test("An uninitialised symbol yields a failure", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["plop"];
    const result = systemUnderTest.operands(["nybble"]);
    expect(systemUnderTest.currentLine().failures.length).toBe(2);
    {
        const failure =
            systemUnderTest.currentLine().failures[0] as ExceptionFailure;
        expect(failure.kind).toBe("js_error");
        expect(failure.exception).toBe("ReferenceError");
        expect(failure.message).toBe("plop is not defined");
        expect(result).toEqual([0]);
    } {
        const failure =
            systemUnderTest.currentLine().failures[1] as AssertionFailure;
        expect(failure.kind).toBe("value_type");
        expect(failure.expected).toBe("nybble");
        expect(failure.actual).toBe("string: ()");
        expect(failure.location).toEqual({"operand": 1});
        expect(result).toEqual([0]);
    }
});
