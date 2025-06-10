import type { AssertionFailure, BoringFailure, ClueFailure, ExceptionFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { numberBag } from "../assembler/bags.ts";
import { directiveFunction } from "../directives/directives.ts";
import { currentLine } from "../line/current-line.ts";
import { dummyLine } from "../line/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { programMemory } from "../program-memory/program-memory.ts";
import { jSExpression } from "../javascript/expression.ts";
import { operands } from "./operands.ts";

const testSystem = () => {
    const $currentLine = currentLine();
    const $line = dummyLine(false, 1);
    $currentLine.forDirectives($line);
    const $cpuRegisters = cpuRegisters();
    $cpuRegisters.initialise(false);
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $directiveFunction = directiveFunction($currentLine);
    const $programMemory = programMemory($currentLine, $symbolTable);
    const $jsExpression = jSExpression($symbolTable, $directiveFunction);
    const $operands = operands($symbolTable, $cpuRegisters, $programMemory, $jsExpression);
    return {
        "line": $line,
        "operands": $operands,
        "symbolTable": $symbolTable
    };
};

Deno.test("Line must have at least expected operands", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.line.symbolicOperands = ["Z"];
    systemUnderTest.operands(systemUnderTest.line, ["onlyZ", "register"]);
    expect(systemUnderTest.line.failed()).toBe(true);
    const failures = systemUnderTest.line.failures;
    expect(failures.length).toBe(2);
    {
        const failure = failures[0] as AssertionFailure;
        expect(failure.kind).toBe("operand_count");
        expect(failure.expected).toBe("2");
        expect(failure.actual).toBe("1");
    } {
        const failure = failures[1] as BoringFailure;
        expect(failure.kind).toBe("operand_blank");
        expect(failure.location!).toEqual({"operand": 1});
    }
});

Deno.test("line must not exceed expected operands", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.line.symbolicOperands = ["R10", "R11"];
    systemUnderTest.operands(systemUnderTest.line, ["register"]);
    expect(systemUnderTest.line.failed()).toBe(true);
    const failures = systemUnderTest.line.failures;
    expect(failures.length).toBe(1);
    const failure = failures[0] as AssertionFailure;
    expect(failure.kind).toBe("operand_count");
    expect(failure.expected).toBe("1");
    expect(failure.actual).toBe("2");
});

Deno.test("line and expectation types must not be different", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.line.symbolicOperands = ["R10", "R12"];
    systemUnderTest.operands(systemUnderTest.line, ["nybble", "ioPort"]);
    expect(systemUnderTest.line.failed()).toBe(true);
    const failures = systemUnderTest.line.failures;
    expect(failures.length).toBe(2);
    {
        const failure = failures[0] as AssertionFailure;
        expect(failure.kind).toBe("value_type");
        expect(failure.location!).toEqual({"operand": 0});
        expect(failure.expected).toBe("nybble");
        expect(failure.actual).toBe("register: R10");
    } {
        const failure = failures[1] as AssertionFailure;
        expect(failure.kind).toBe("value_type");
        expect(failure.location!).toEqual({"operand": 1});
        expect(failure.expected).toBe("ioPort");
        expect(failure.actual).toBe("register: R12");
    }
});

Deno.test("Everything's lovely when actual and expected match", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.line.symbolicOperands = ["R10", "10 / 2"];
    const result = systemUnderTest.operands(systemUnderTest.line, ["register", "nybble"]);
    expect(systemUnderTest.line.failed()).toBe(false);
    expect(systemUnderTest.line.failures.length).toBe(0);
    expect(result).toEqual([10, 5]);
});

Deno.test("Some operands can be optional", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.line.symbolicOperands = [];
    const result = systemUnderTest.operands(systemUnderTest.line, ["optionalZ+"]);
    expect(systemUnderTest.line.failed()).toBe(false);
    expect(systemUnderTest.line.failures.length).toBe(0);
    expect(result).toEqual([0]);
});

Deno.test("An expression yields a value", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.line.symbolicOperands = ["20 / 2"];
    const result = systemUnderTest.operands(systemUnderTest.line, ["nybble"]);
    expect(systemUnderTest.line.failed()).toBe(false);
    expect(systemUnderTest.line.failures.length).toBe(0);
    expect(result).toEqual([10]);
});

Deno.test("A register symbol yields a value", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.line.symbolicOperands = ["R7"];
    const result = systemUnderTest.operands(systemUnderTest.line, ["register"]);
    expect(systemUnderTest.line.failed()).toBe(false);
    expect(systemUnderTest.line.failures.length).toBe(0);
    expect(result).toEqual([7]);
});

Deno.test("A non-existant register symbol yields failures", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.line.symbolicOperands = ["R99"];
    const result = systemUnderTest.operands(systemUnderTest.line, ["register"]);
    expect(systemUnderTest.line.failed()).toBe(true);
    expect(systemUnderTest.line.failures.length).toBe(1);
    const failure = systemUnderTest.line.failures[0] as ClueFailure;
    expect(failure.kind).toBe("register_notFound");
    expect(failure.clue).toBe("R99");
    expect(failure.location).toEqual({"operand": 0});
    expect(result).toEqual([0]);
});

Deno.test("A register can't be used for a number", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.line.symbolicOperands = ["R7"];
    const result = systemUnderTest.operands(systemUnderTest.line, ["6BitNumber"]);
    expect(systemUnderTest.line.failed()).toBe(true);
    expect(systemUnderTest.line.failures.length).toBe(1);
    const failure = systemUnderTest.line.failures[0] as AssertionFailure;
    expect(failure.kind).toBe("value_type");
    expect(failure.actual).toBe("register: R7");
    expect(failure.expected).toBe("6BitNumber");
    expect(failure.location).toEqual({"operand": 0});
    expect(result).toEqual([0]);
});

Deno.test("A symbol can't be used as a register", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.builtInSymbol("plop", numberBag(5));
    systemUnderTest.line.symbolicOperands = ["plop", "plop"];
    const result = systemUnderTest.operands(systemUnderTest.line, ["byte", "register"]);
    expect(systemUnderTest.line.failed()).toBe(true);
    expect(systemUnderTest.line.failures.length).toBe(1);
    const failure = systemUnderTest.line.failures[0] as ClueFailure;
    expect(failure.kind).toBe("register_notFound");
    expect(failure.clue).toBe("plop");
    expect(failure.location).toEqual({"operand": 1});
    expect(result).toEqual([5, 0]);
});

Deno.test("'Special' operands yield a numeric value", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.line.symbolicOperands = ["Z+"];
    const result = systemUnderTest.operands(systemUnderTest.line, ["ZorZ+"]);
    expect(systemUnderTest.line.failed()).toBe(false);
    expect(systemUnderTest.line.failures.length).toBe(0);
    expect(result).toEqual([1]);
});

Deno.test("Bad 'special' operands yield failures", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.line.symbolicOperands = ["plop"];
    const result = systemUnderTest.operands(systemUnderTest.line, ["onlyZ"]);
    expect(systemUnderTest.line.failed()).toBe(true);
    expect(systemUnderTest.line.failures.length).toBe(1);
    const failure = systemUnderTest.line.failures[0] as AssertionFailure;
    expect(failure.kind).toBe("value_type");
    expect(failure.expected).toBe("Z");
    expect(failure.actual).toBe("plop");
    expect(failure.location).toEqual({"operand": 0});
    expect(result).toEqual([0]);
});

Deno.test("Optional parameters can be absent", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.line.symbolicOperands = [];
    const result = systemUnderTest.operands(systemUnderTest.line, ["optionalZ+"]);
    expect(systemUnderTest.line.failed()).toBe(false);
    expect(systemUnderTest.line.failures.length).toBe(0);
    expect(result).toEqual([0]);
});

Deno.test("... or present", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.line.symbolicOperands = ["Z+"];
    const result = systemUnderTest.operands(systemUnderTest.line, ["optionalZ+"]);
    expect(systemUnderTest.line.failed()).toBe(false);
    expect(systemUnderTest.line.failures.length).toBe(0);
    expect(result).toEqual([1]);
});

Deno.test("Incorrect optional parameters yield a failure", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.line.symbolicOperands = ["plop"];
    const result = systemUnderTest.operands(systemUnderTest.line, ["optionalZ+"]);
    expect(systemUnderTest.line.failed()).toBe(true);
    expect(systemUnderTest.line.failures.length).toBe(1);
    const failure = systemUnderTest.line.failures[0] as AssertionFailure;
    expect(failure.kind).toBe("value_type");
    expect(failure.expected).toBe("undefined, Z+");
    expect(failure.actual).toBe("plop");
    expect(failure.location).toEqual({"operand": 0});
    expect(result).toEqual([0]);
});

Deno.test("An uninitialised symbol yields a failure", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.line.symbolicOperands = ["plop"];
    const result = systemUnderTest.operands(systemUnderTest.line, ["nybble"]);
    expect(systemUnderTest.line.failed()).toBe(true);
    expect(systemUnderTest.line.failures.length).toBe(1);
    const failure = systemUnderTest.line.failures[0] as ExceptionFailure;
    expect(failure.kind).toBe("js_error");
    expect(failure.exception).toBe("ReferenceError");
    expect(failure.message).toBe("plop is not defined");
    expect(failure.location).toEqual({"operand": 0});
    expect(result).toEqual([0]);
});
