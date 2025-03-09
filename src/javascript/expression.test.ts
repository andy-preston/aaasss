import { assertEquals } from "assert";
import { numberBag } from "../assembler/bags.ts";
import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { directiveList } from "../directives/directive-list.ts";
import type { Failure } from "../failure/bags.ts";
import { assertFailureWithExtra, assertSuccessWith } from "../failure/testing.ts";
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
    assertSuccessWith(system.jsExpression("5 + 7"), "12");
});

Deno.test("Javascript can contain strings", () => {
    const system = systemUnderTest();
    assertSuccessWith(system.jsExpression("'single quoted'"), "single quoted");
    assertSuccessWith(system.jsExpression('"double quoted"'), "double quoted");
});

Deno.test("If the result is undefined, `value` returns empty string", () => {
    const system = systemUnderTest();
    assertSuccessWith(system.jsExpression("undefined;"), "");
});

Deno.test("A plain assignment will not return a value", () => {
    const system = systemUnderTest();
    assertSuccessWith(system.jsExpression("const test = 4;"), "");
});

Deno.test("Javascript can contain newlines", () => {
    const system = systemUnderTest();
    const js = "const test1 = 4;\nconst test2 = 6;\ntest1 + test2;";
    assertSuccessWith(system.jsExpression(js), "10");
});

Deno.test("Javascript can get value from the symbol table", () => {
    const system = systemUnderTest();
    system.symbols.add("plop", numberBag(23), "mock.asm", 10);
    const result = system.jsExpression("plop");
    assertSuccessWith(result, "23");
});

Deno.test("...but not any of the registers", () => {
    const system = systemUnderTest();
    system.cpuRegisters.initialise(false);
    const result = system.jsExpression("R7 + 5");
    assertEquals(result.type, "failures");
    assertFailureWithExtra(
        result.it as Array<Failure>, "js_error", ["ReferenceError", "R7 is not defined"]
    );
});

Deno.test("An unknown variable gives a reference error", () => {
    const system = systemUnderTest();
    const result = system.jsExpression("const test = plop * 10;");
    assertEquals(result.type, "failures");
    assertFailureWithExtra(
        result.it as Array<Failure>, "js_error", ["ReferenceError", "plop is not defined"]
    );
});

Deno.test("Syntax errors are returned as errors too", () => {
    const system = systemUnderTest();
    const result = system.jsExpression("this is just nonsense");
    assertEquals(result.type, "failures");
    assertFailureWithExtra(
        result.it as Array<Failure>, "js_error", ["SyntaxError", "Unexpected identifier 'is'"]
    );
});

Deno.test("A symbol will not be assigned using `this.symbol`", () => {
    const system = systemUnderTest();
    const result = system.jsExpression("this.plop = 27");
    assertEquals(result.type, "failures");
    assertFailureWithExtra(
        result.it as Array<Failure>, "js_error", ["ReferenceError", "this_assignment"]
    );
});
