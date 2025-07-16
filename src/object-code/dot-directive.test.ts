import type { DirectiveResult } from "../directives/data-types.ts";

import { expect } from "jsr:@std/expect";
import { testSystem } from "./testing.ts";

Deno.test("A mnemonic of dot evaluates a mock operand", () => {
    const systemUnderTest = testSystem();
    let directiveWasExecuted = false;
    const testDirective = (): DirectiveResult => {
        directiveWasExecuted = true;
        return undefined;
    };
    systemUnderTest.symbolTable.builtInSymbol("testDirective", testDirective);
    systemUnderTest.currentLine().mnemonic = ".";
    systemUnderTest.currentLine().operands = ["testDirective()"];
    systemUnderTest.objectCode.line();
    expect(directiveWasExecuted).toBe(true);
});

Deno.test("And shows any failures on the current line", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().mnemonic = ".";
    systemUnderTest.currentLine().operands = ["testDirective()"];
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "js_error", "location": undefined,
        "exception": "ReferenceError",
        "message": "testDirective is not defined"
    }]);
});

Deno.test("A dot must have one operand (directive)", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().mnemonic = ".";
    systemUnderTest.currentLine().operands = [];
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "operand_count", "location": undefined,
        "expected": "1", "actual": "0"
    }, {
        "kind": "value_type", "location": {"operand": 1},
        "expected": "directive", "actual": "string: ()"
    }]);
});

Deno.test("A dot can't have multiple operands", () => {
    const systemUnderTest = testSystem();
    const testDirective = (): DirectiveResult => {
        return undefined;
    };
    systemUnderTest.symbolTable.builtInSymbol("one", testDirective);
    systemUnderTest.currentLine().mnemonic = ".";
    systemUnderTest.currentLine().operands = ["one", "2"];
    systemUnderTest.objectCode.line();
    expect(systemUnderTest.currentLine().failures).toEqual([{
        "kind": "operand_count", "location": undefined,
        "expected": "1", "actual": "2"
    }]);
});
