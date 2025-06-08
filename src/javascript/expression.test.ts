import type { ExceptionFailure, Failure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { numberBag } from "../assembler/bags.ts";
import { currentLine } from "../line/current-line.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { jSExpression } from "./expression.ts";

const testSystem = () => {
    const $currentLine = currentLine();
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $jSExpression = jSExpression($symbolTable)
    return {
        "symbolTable": $symbolTable,
        "cpuRegisters": $cpuRegisters,
        "jsExpression": $jSExpression
    };
};

Deno.test("The last expression in the code is returned", () => {
    const system = testSystem();
    const result = system.jsExpression("5 + 7");
    expect(result.type).not.toBe("failures");
    expect(result.it).toBe("12");
});

Deno.test("Javascript can contain single quoted strings", () => {
    const system = testSystem();
    const result = system.jsExpression("'single quoted'");
    expect(result.type).not.toBe("failures");
    expect(result.it).toBe("single quoted");
});

Deno.test("Javascript can contain double quoted strings", () => {
    const system = testSystem();
    const result = system.jsExpression('"double quoted"');
    expect(result.type).not.toBe("failures");
    expect(result.it).toBe("double quoted");
});

Deno.test("If the result is undefined, `value` returns empty string", () => {
    const system = testSystem();
    const result = system.jsExpression("undefined;");
    expect(result.type).not.toBe("failures");
    expect(result.it).toBe("");
});

Deno.test("A plain assignment will not return a value", () => {
    const system = testSystem();
    const result = system.jsExpression("const test = 4;");
    expect(result.type).not.toBe("failures");
    expect(result.it).toBe("");
});

Deno.test("Javascript can contain newlines", () => {
    const system = testSystem();
    const result = system.jsExpression(
        "const test1 = 4;\nconst test2 = 6;\ntest1 + test2;"
    );
    expect(result.type).not.toBe("failures");
    expect(result.it).toBe("10");
});

Deno.test("Javascript can get value from the symbol table", () => {
    const system = testSystem();
    system.symbolTable.persistentSymbol("plop", numberBag(23));
    const result = system.jsExpression("plop");
    expect(result.type).not.toBe("failures");
    expect(result.it).toBe("23");
});

Deno.test("...but not any of the registers", () => {
    const system = testSystem();
    system.cpuRegisters.initialise(false);
    const result = system.jsExpression("R7 + 5");
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("js_error");
    const failure = failures[0] as ExceptionFailure;
    expect(failure.exception).toBe("ReferenceError");
    expect(failure.message).toBe("R7 is not defined");
});

Deno.test("An unknown variable gives a reference error", () => {
    const system = testSystem();
    const result = system.jsExpression("const test = plop * 10;");
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("js_error");
    const failure = failures[0] as ExceptionFailure;
    expect(failure.exception).toBe("ReferenceError");
    expect(failure.message).toBe("plop is not defined");
});

Deno.test("Syntax errors are returned as errors too", () => {
    const system = testSystem();
    const result = system.jsExpression("this is just nonsense");
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("js_error");
    const failure = failures[0] as ExceptionFailure;
    expect(failure.exception).toBe("SyntaxError");
    expect(failure.message).toBe("Unexpected identifier 'is'");
});

Deno.test("A symbol will not be assigned using `this.symbol`", () => {
    const system = testSystem();
    const result = system.jsExpression("this.plop = 27");
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("js_error");
    const failure = failures[0] as ExceptionFailure;
    expect(failure.exception).toBe("ReferenceError");
    expect(failure.message).toBe("this_assignment");
});
