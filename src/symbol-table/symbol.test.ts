import { pass } from "../assembler/pass.ts";
import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { anEmptyContext } from "../javascript/context.ts";
import { jSExpression } from "../javascript/expression.ts";
import { symbolTable } from "./symbol-table.ts";

export const testEnvironment = () => {
    const context = anEmptyContext();
    return {
        "expression": jSExpression(context),
        "table": symbolTable(context, pass().public)
    };
};

Deno.test("A symbol can be defined and accessed", () => {
    const environment = testEnvironment();
    assertSuccess(environment.table.defineDirective("plop", 57), undefined);
    assertSuccess(environment.expression("plop"), "57");
});

Deno.test("A symbol can't be redefined to a new value", () => {
    const environment = testEnvironment();
    assertSuccess(environment.table.defineDirective("plop", 57), undefined);
    assertFailure(environment.table.defineDirective("plop", 75), "context_redefined");
});

Deno.test("... but it can be 'redefined' with the same value", () => {
    const environment = testEnvironment();
    assertSuccess(environment.table.defineDirective("plop", 57), undefined);
    assertSuccess(environment.expression("plop"), "57");
    assertSuccess(environment.table.defineDirective("plop", 57), undefined);
    assertSuccess(environment.expression("plop"), "57");
});
