import { pass } from "../assembler/pass.ts";
import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { anEmptyContext } from "../javascript/context.ts";
import { jSExpression } from "../javascript/expression.ts";
import { symbolTable } from "./symbol-table.ts";

export const testEnvironment = () => {
    const context = anEmptyContext();
    const currentPass = pass();
    return {
        "expression": jSExpression(context),
        "define": symbolTable(context, currentPass).defineDirective,
        "pass": currentPass
    };
};

Deno.test("A symbol can be defined and accessed", () => {
    const environment = testEnvironment();
    assertSuccess(environment.define("plop", 57), undefined);
    assertSuccess(environment.expression("plop"), "57");
});

Deno.test("A symbol can't be redefined to a new value", () => {
    const environment = testEnvironment();
    assertSuccess(environment.define("plop", 57), undefined);
    assertFailure(environment.define("plop", 75), "context_redefined");
});

Deno.test("... but it can be 'redefined' with the same value", () => {
    const environment = testEnvironment();
    assertSuccess(environment.define("plop", 57), undefined);
    assertSuccess(environment.expression("plop"), "57");
    assertSuccess(environment.define("plop", 57), undefined);
    assertSuccess(environment.expression("plop"), "57");
});

Deno.test("If a symbol isn't used, a warning is issued", () => {
    const environment = testEnvironment();
    assertSuccess(environment.define("plop", 57), undefined);
    environment.pass.second();
    assertFailure(environment.define("plop", 57), "symbol_notUsed");
});

Deno.test("If a symbol is used, no warning is issued", () => {
    const environment = testEnvironment();
    assertSuccess(environment.define("plop", 57), undefined);
    assertSuccess(environment.expression("plop"), "57");
    environment.pass.second();
    assertSuccess(environment.define("plop", 57), undefined);
});
