import type { ExceptionFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { currentLine } from "../line/current-line.ts";
import { emptyLine } from "../line/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { jSExpression } from "./expression.ts";

const testSystem = () => {
    const $currentLine = currentLine();
    $currentLine(emptyLine("plop.asm"));
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $jSExpression = jSExpression($currentLine, $symbolTable);
    return {
        "currentLine": $currentLine,
        "symbolTable": $symbolTable,
        "cpuRegisters": $cpuRegisters,
        "jsExpression": $jSExpression
    };
};

Deno.test("The last expression in the code is returned", () => {
    const systemUnderTest = testSystem();
    const result = systemUnderTest.jsExpression("5 + 7");
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(result).toBe("12");
});

Deno.test("Javascript can contain single quoted strings", () => {
    const systemUnderTest = testSystem();
    const result = systemUnderTest.jsExpression("'single quoted'");
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(result).toBe("single quoted");
});

Deno.test("Javascript can contain double quoted strings", () => {
    const systemUnderTest = testSystem();
    const result = systemUnderTest.jsExpression('"double quoted"');
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(result).toBe("double quoted");
});

Deno.test("If the result is undefined, `value` returns empty string", () => {
    const systemUnderTest = testSystem();
    const result = systemUnderTest.jsExpression("undefined;");
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(result).toBe("");
});

Deno.test("A plain assignment will not return a value", () => {
    const systemUnderTest = testSystem();
    const result = systemUnderTest.jsExpression("const test = 4;");
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(result).toBe("");
});

Deno.test("Javascript can contain newlines", () => {
    const systemUnderTest = testSystem();
    const result = systemUnderTest.jsExpression(
        "const test1 = 4;\nconst test2 = 6;\ntest1 + test2;"
    );
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(result).toBe("10");
});

Deno.test("Javascript can get value from the symbol table", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.persistentSymbol("plop", 23);
    const result = systemUnderTest.jsExpression("plop");
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(result).toBe("23");
});

Deno.test("...but not any of the registers", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.cpuRegisters.initialise(false);
    const result = systemUnderTest.jsExpression("R7 + 5");
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure =
        systemUnderTest.currentLine().failures[0] as ExceptionFailure;
    expect(failure.kind).toBe("js_error");
    expect(failure.exception).toBe("ReferenceError");
    expect(failure.message).toBe("R7 is not defined");
    expect(result).toBe("");
});

Deno.test("An unknown variable gives a reference error", () => {
    const systemUnderTest = testSystem();
    const result = systemUnderTest.jsExpression("const test = plop * 10;");
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure =
        systemUnderTest.currentLine().failures[0] as ExceptionFailure;
    expect(failure.kind).toBe("js_error");
    expect(failure.exception).toBe("ReferenceError");
    expect(failure.message).toBe("plop is not defined");
    expect(result).toBe("");
});

Deno.test("Syntax errors are returned as errors too", () => {
    const systemUnderTest = testSystem();
    const result = systemUnderTest.jsExpression("this is just nonsense");
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure =
        systemUnderTest.currentLine().failures[0] as ExceptionFailure;
    expect(failure.kind).toBe("js_error");
    expect(failure.exception).toBe("SyntaxError");
    expect(failure.message).toBe("Unexpected identifier 'is'");
    expect(result).toBe("");
});

Deno.test("A symbol will not be assigned using `this.symbol`", () => {
    const systemUnderTest = testSystem();
    const result = systemUnderTest.jsExpression("this.plop = 27");
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    const failure =
        systemUnderTest.currentLine().failures[0] as ExceptionFailure;
    expect(failure.kind).toBe("js_error");
    expect(failure.exception).toBe("ReferenceError");
    expect(failure.message).toBe("this_assignment");
    expect(result).toBe("");
});
