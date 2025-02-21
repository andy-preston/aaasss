import { assertEquals } from "assert";
import { pass } from "../assembler/pass.ts";
import { deviceProperties } from "../device/properties.ts";
import { emptyBox, failure } from "../failure/failure-or-box.ts";
import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { jSExpression } from "../javascript/expression.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import type { Directive } from "./data-types.ts";
import { directiveList } from "./directive-list.ts";

export const systemUnderTest = () => {
    const directives = directiveList()
    const symbols = symbolTable(
        directives, deviceProperties().public, cpuRegisters(), pass()
    );
    return {
        "directiveList": directives,
        "define": symbols.defineDirective,
        "expression": jSExpression(symbols)
    };
};

Deno.test("Any directives that are added can be called as functions", () => {
    const system = systemUnderTest();
    let directiveParameter = "";
    const testDirective: Directive = (parameter: string)=> {
        directiveParameter = parameter;
        return emptyBox();
    };
    system.directiveList.includes("testDirective", testDirective);
    system.expression("testDirective('says hello')");
    assertEquals(directiveParameter, "says hello");
});

Deno.test("Directives can return a failure", () => {
    const system = systemUnderTest();
    const testDirective: Directive = (_: string) => {
        return failure(undefined, "file_notFound", undefined);
    };
    system.directiveList.includes("testDirective", testDirective);
    const result = system.expression("testDirective('')");
    assertFailure(result, "file_notFound");
});

Deno.test("Directives can return success in the form of an empty box", () => {
    const system = systemUnderTest();
    const testDirective: Directive = (_: string) => {
        return emptyBox();
    };
    system.directiveList.includes("testDirective", testDirective);
    const result = system.expression("testDirective('')");
    assertSuccess(result, "");
});

Deno.test("You can't create a symbol with the same name as a directive", () => {
    const system = systemUnderTest();
    const testDirective: Directive = (_: string) => {
        return emptyBox();
    };
    system.directiveList.includes("testDirective", testDirective);
    const result = system.define("testDirective", 47);
    assertFailure(result, "symbol_nameIsDirective");
});
