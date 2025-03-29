import { assertEquals, assertNotEquals } from "jsr:@std/assert";
import { numberBag } from "../assembler/bags.ts";
import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { directiveList } from "../directives/directive-list.ts";
import type { ExceptionFailure, Failure } from "../failure/bags.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { jSExpression } from "./expression.ts";

const systemUnderTest = () => {
    const registers = cpuRegisters();
    const symbols = symbolTable(
        directiveList(), deviceProperties().public, registers, pass()
    );
    return {
        "symbols": symbols,
        "cpuRegisters": registers,
        "jsExpression": jSExpression(symbols)
    };
};

Deno.test("The last expression in the code is returned", () => {
    const system = systemUnderTest();
    const result = system.jsExpression("5 + 7");
    assertNotEquals(result.type, "failures");
    assertEquals(result.it, "12");
});

Deno.test("Javascript can contain single quoted strings", () => {
    const system = systemUnderTest();
    const result = system.jsExpression("'single quoted'");
    assertNotEquals(result.type, "failures");
    assertEquals(result.it, "single quoted");
});

Deno.test("Javascript can contain double quoted strings", () => {
    const system = systemUnderTest();
    const result = system.jsExpression('"double quoted"');
    assertNotEquals(result.type, "failures");
    assertEquals(result.it, "double quoted");
});

Deno.test("If the result is undefined, `value` returns empty string", () => {
    const system = systemUnderTest();
    const result = system.jsExpression("undefined;");
    assertNotEquals(result.type, "failures");
    assertEquals(result.it, "");
});

Deno.test("A plain assignment will not return a value", () => {
    const system = systemUnderTest();
    const result = system.jsExpression("const test = 4;");
    assertNotEquals(result.type, "failures");
    assertEquals(result.it, "");
});

Deno.test("Javascript can contain newlines", () => {
    const system = systemUnderTest();
    const result = system.jsExpression(
        "const test1 = 4;\nconst test2 = 6;\ntest1 + test2;"
    );
    assertNotEquals(result.type, "failures");
    assertEquals(result.it, "10");
});

Deno.test("Javascript can get value from the symbol table", () => {
    const system = systemUnderTest();
    system.symbols.add("plop", numberBag(23), "mock.asm", 10);
    const result = system.jsExpression("plop");
    assertNotEquals(result.type, "failures");
    assertEquals(result.it, "23");
});

Deno.test("...but not any of the registers", () => {
    const system = systemUnderTest();
    system.cpuRegisters.initialise(false);
    const result = system.jsExpression("R7 + 5");
    assertEquals(result.type, "failures");
    const failures = result.it as Array<Failure>;
    assertEquals(failures.length, 1);
    assertEquals(failures[0]!.kind, "js_error");
    const failure = failures[0] as ExceptionFailure;
    assertEquals(failure.exception, "ReferenceError");
    assertEquals(failure.message, "R7 is not defined");
});

Deno.test("An unknown variable gives a reference error", () => {
    const system = systemUnderTest();
    const result = system.jsExpression("const test = plop * 10;");
    assertEquals(result.type, "failures");
    const failures = result.it as Array<Failure>;
    assertEquals(failures.length, 1);
    assertEquals(failures[0]!.kind, "js_error");
    const failure = failures[0] as ExceptionFailure;
    assertEquals(failure.exception, "ReferenceError");
    assertEquals(failure.message, "plop is not defined");
});

Deno.test("Syntax errors are returned as errors too", () => {
    const system = systemUnderTest();
    const result = system.jsExpression("this is just nonsense");
    assertEquals(result.type, "failures");
    const failures = result.it as Array<Failure>;
    assertEquals(failures.length, 1);
    assertEquals(failures[0]!.kind, "js_error");
    const failure = failures[0] as ExceptionFailure;
    assertEquals(failure.exception, "SyntaxError");
    assertEquals(failure.message, "Unexpected identifier 'is'");
});

Deno.test("A symbol will not be assigned using `this.symbol`", () => {
    const system = systemUnderTest();
    const result = system.jsExpression("this.plop = 27");
    assertEquals(result.type, "failures");
    const failures = result.it as Array<Failure>;
    assertEquals(failures.length, 1);
    assertEquals(failures[0]!.kind, "js_error");
    const failure = failures[0] as ExceptionFailure;
    assertEquals(failure.exception, "ReferenceError");
    assertEquals(failure.message, "this_assignment");
});
