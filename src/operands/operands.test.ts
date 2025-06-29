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
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "operand_count", "location": undefined,
        "expected": "2",  "actual": "1"
    }, {
        "kind": "register_notFound", "location": {"operand": 2},
        "clue": ""
    }]);
});

Deno.test("Line must have at least the expected numeric operands", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["Z"];
    systemUnderTest.operands(["onlyZ", "6BitNumber"]);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "operand_count", "location": undefined,
        "expected": "2",  "actual": "1"
    }, {
        "kind": "value_type", "location": {"operand": 2},
        "expected": "6BitNumber", "actual": "string: ()"
    }]);
});

Deno.test("Line must not exceed expected operands", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["R10", "R11", "R12"];
    systemUnderTest.operands(["register", "register"]);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "operand_count",
        "expected": "2", "actual": "3"
    }]);
});

Deno.test("line and expectation types must not be different", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["R10", "R12"];
    systemUnderTest.operands(["nybble", "ioPort"]);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "value_type", "location": {"operand": 1},
        "expected": "nybble", "actual": "string: (register: R10)"
    }, {
        "kind": "value_type", "location": {"operand": 2},
        "expected": "ioPort", "actual": "string: (register: R12)"
    }]);
});

Deno.test("Everything's lovely when actual and expected match", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["R10", "10 / 2"];
    const result = systemUnderTest.operands(["register", "nybble"]);
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(result).toEqual([10, 5]);
});

Deno.test("Some mnemonics don't have any operands at all", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = [];
    systemUnderTest.operands([]);
    expect(systemUnderTest.currentLine().failures).toEqual([]);
});

Deno.test("... and providing some isn't allowed", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["R5", "12"];
    systemUnderTest.operands([]);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "operand_count", "location": undefined,
        "expected": "0", "actual": "2"
    }]);
});

Deno.test("Optional parameters can be absent", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = [];
    const result = systemUnderTest.operands(["optionalZ+"]);
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(result).toEqual([0]);
});

Deno.test("... or present", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["Z+"];
    const result = systemUnderTest.operands(["optionalZ+"]);
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(result).toEqual([1]);
});

Deno.test("Incorrect optional parameters yield a failure", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["plop"];
    const result = systemUnderTest.operands(["optionalZ+"]);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "value_type", "location": {"operand": 1},
        "expected": "undefined, Z+", "actual": "string: (plop)"
    }]);
    expect(result).toEqual([0]);
});

Deno.test("An expression yields a value", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["20 / 2"];
    const result = systemUnderTest.operands(["nybble"]);
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(result).toEqual([10]);
});

Deno.test("A register symbol yields a value", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["R7"];
    const result = systemUnderTest.operands(["register"]);
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(result).toEqual([7]);
});

Deno.test("A non-existant register symbol yields failures", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["R99"];
    const result = systemUnderTest.operands(["register"]);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "register_notFound", "location": {"operand": 1},
        "clue": "R99"
    }]);
    expect(result).toEqual([0]);
});

Deno.test("A register can't be used for a number", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["R7"];
    const result = systemUnderTest.operands(["6BitNumber"]);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "value_type", "location": {"operand": 1},
        "expected": "6BitNumber", "actual": "string: (register: R7)"
    }]);
    expect(result).toEqual([0]);
});

Deno.test("A symbol can't be used as a register", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.builtInSymbol("plop", 5);
    systemUnderTest.currentLine().operands = ["plop", "plop"];
    const result = systemUnderTest.operands(["byte", "register"]);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "register_notFound", "location": {"operand": 2},
        "clue": "plop"
    }]);
    expect(result).toEqual([5, 0]);
});

Deno.test("'Specific Symbolic' operands yield a numeric value", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["Z+"];
    const result = systemUnderTest.operands(["ZorZ+"]);
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(result).toEqual([1]);
});

Deno.test("Bad 'Specific Symbolic' operands yield failures", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["plop"];
    const result = systemUnderTest.operands(["onlyZ"]);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "value_type", "location": {"operand": 1},
        "expected": "Z", "actual": "string: (plop)"
    }]);
    expect(result).toEqual([0]);
});

Deno.test("Indirect Offset operands are extracted from a single operand with horrible syntax", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["Y+23"];
    const result = systemUnderTest.operands(["indexWithOffset", "6BitOffset"]);
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(result).toEqual([1, 23]);
});

Deno.test("Indirect Offset operands can be an expression", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["Y+5+5"];
    const result = systemUnderTest.operands(["indexWithOffset", "6BitOffset"]);
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(result).toEqual([1, 10]);
});

Deno.test("Indirect Offset doesn't use the X register", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["X+23"];
    const result = systemUnderTest.operands(["indexWithOffset", "6BitOffset"]);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "value_type", "location": {"operand": 1},
        "expected": "Z+, Y+", "actual": "X+23"
    }]);
    expect(result).toEqual([0, 23]);
});

Deno.test("Indirect Offset must resolve to a number", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["Y+plop"];
    const result = systemUnderTest.operands(["indexWithOffset", "6BitOffset"]);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "js_error", "location": undefined,
        "exception": "ReferenceError", "message": "plop is not defined"
    }, {
        "kind": "value_type", "location": {"operand": 1},
        "expected": "6BitOffset", "actual": "Y+plop"
    }]);
    expect(result).toEqual([1, 0]);
});

Deno.test("An uninitialised symbol yields a failure", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().operands = ["plop"];
    const result = systemUnderTest.operands(["nybble"]);
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "js_error",
        "exception": "ReferenceError", "message": "plop is not defined"
    }, {
        "kind": "value_type", "location": {"operand": 1},
        "expected": "nybble", "actual": "string: ()"
    }]);
    expect(result).toEqual([0]);
});
