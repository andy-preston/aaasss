import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { directiveList } from "../directives/directive-list.ts";
import { assertFailureWithError, assertSuccess } from "../failure/testing.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { jSExpression } from "./expression.ts";

const testEnvironment = () => {
    const symbols = symbolTable(
        directiveList(), deviceProperties().public, cpuRegisters(), pass()
    );
    return {
        "symbols": symbols,
        "expression": jSExpression(symbols)
    };
};

Deno.test("The last expression in the code is returned", () => {
    const environment = testEnvironment();
    assertSuccess(environment.expression("5 + 7"), "12");
});

Deno.test("Javascript can contain strings", () => {
    const environment = testEnvironment();
    assertSuccess(environment.expression("'single quoted'"), "single quoted");
    assertSuccess(environment.expression('"double quoted"'), "double quoted");
});


Deno.test("If the result is undefined, `value` returns empty string", () => {
    const environment = testEnvironment();
    assertSuccess(environment.expression("undefined;"), "");
});

Deno.test("A plain assignment will not return a value", () => {
    const environment = testEnvironment();
    assertSuccess(environment.expression("const test = 4;"), "");
});

Deno.test("Javascript can contain newlines", () => {
    const environment = testEnvironment();
    const js = "const test1 = 4;\nconst test2 = 6;\ntest1 + test2;";
    assertSuccess(environment.expression(js), "10");
});

Deno.test("Javascript can get value from the symbol table", () => {
    const environment = testEnvironment();
    environment.symbols.add("plop", 23);
    const result = environment.expression("plop");
    assertSuccess(result, "23");
});

Deno.test("An unknown variable gives a reference error", () => {
    const environment = testEnvironment();
    assertFailureWithError(
        environment.expression("const test = plop * 10;"),
        "js_error",
        ReferenceError,
        "plop is not defined"
    );
});

Deno.test("Syntax errors are returned as errors too", () => {
    const environment = testEnvironment();
    assertFailureWithError(
        environment.expression("this is just nonsense"),
        "js_error",
        SyntaxError,
        "Unexpected identifier 'is'"
    );
});
