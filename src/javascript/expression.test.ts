import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { directiveList } from "../directives/directive-list.ts";
import { assertFailureWithError, assertSuccess } from "../failure/testing.ts";
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
        "expression": jSExpression(symbols)
    };
};

Deno.test("The last expression in the code is returned", () => {
    const system = systemUnderTest();
    assertSuccess(system.expression("5 + 7"), "12");
});

Deno.test("Javascript can contain strings", () => {
    const system = systemUnderTest();
    assertSuccess(system.expression("'single quoted'"), "single quoted");
    assertSuccess(system.expression('"double quoted"'), "double quoted");
});

Deno.test("If the result is undefined, `value` returns empty string", () => {
    const system = systemUnderTest();
    assertSuccess(system.expression("undefined;"), "");
});

Deno.test("A plain assignment will not return a value", () => {
    const system = systemUnderTest();
    assertSuccess(system.expression("const test = 4;"), "");
});

Deno.test("Javascript can contain newlines", () => {
    const system = systemUnderTest();
    const js = "const test1 = 4;\nconst test2 = 6;\ntest1 + test2;";
    assertSuccess(system.expression(js), "10");
});

Deno.test("Javascript can get value from the symbol table", () => {
    const system = systemUnderTest();
    system.symbols.add("plop", 23);
    const result = system.expression("plop");
    assertSuccess(result, "23");
});

Deno.test("...but not any of the registers", () => {
    const system = systemUnderTest();
    system.cpuRegisters.initialise(false);
    const result = system.expression("R7 + 5");
    assertFailureWithError(
        result, "js_error", ReferenceError, "R7 is not defined"
    );
});

Deno.test("An unknown variable gives a reference error", () => {
    const system = systemUnderTest();
    assertFailureWithError(
        system.expression("const test = plop * 10;"),
        "js_error",
        ReferenceError,
        "plop is not defined"
    );
});

Deno.test("Syntax errors are returned as errors too", () => {
    const system = systemUnderTest();
    assertFailureWithError(
        system.expression("this is just nonsense"),
        "js_error",
        SyntaxError,
        "Unexpected identifier 'is'"
    );
});
