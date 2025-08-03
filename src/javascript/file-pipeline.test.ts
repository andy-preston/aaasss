import type { UncheckedParameters } from "../directives/data-types.ts";

import { expect } from "jsr:@std/expect";
import { currentLine, emptyLine } from "../assembler/line.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { jsFunction } from "./function.ts";
import { jsFilePipeline } from "./file-pipeline.ts";

const testSystem = () => {
    const $currentLine = currentLine();
    $currentLine(emptyLine("plop.js"));
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    let testResult: string = "";
    $symbolTable.persistentSymbol(
        "testResult",
        (...parameters: UncheckedParameters) => {
            testResult = `${parameters}`;
            return undefined;
        }
    );
    const $jsFunction = jsFunction($currentLine, $symbolTable);
    const $jsFilePipeline = jsFilePipeline($currentLine, $jsFunction);

    return {
        "currentLine": $currentLine,
        "jsFilePipeline": $jsFilePipeline,
        "symbolTable": $symbolTable,
        "testResult": () => testResult
    };
};

Deno.test("JS can contain comments", () => {
    const systemUnderTest = testSystem();
    const testSource = [
        "const test = 27; /* comment 1 ",
        " comment 2 */",
        'const message = "hello"; // comment 3',
        "/* comment 4 */ testResult(test, message);"
    ];
    testSource.forEach((sourceLine, index) => {
        systemUnderTest.currentLine().sourceCode = sourceLine;
        systemUnderTest.currentLine().eof = index + 1 == testSource.length;
        systemUnderTest.jsFilePipeline();
        expect(systemUnderTest.currentLine().failures).toEqual([]);
    });
    expect(systemUnderTest.testResult()).toBe("27,hello");
});

Deno.test("JS Can execute get values from the symbol table", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.symbolTable.persistentSymbol("plop", 57);
    systemUnderTest.currentLine().sourceCode = "testResult(plop);";
    systemUnderTest.currentLine().eof = true;
    systemUnderTest.jsFilePipeline();
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(systemUnderTest.testResult()).toBe("57");
});

Deno.test("A symbol assignment does not pollute the `this` context object", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().sourceCode =
        "plop = 27; testResult(this.plop);";
    systemUnderTest.currentLine().eof = true;
    systemUnderTest.jsFilePipeline();
    expect(systemUnderTest.currentLine().failures).toEqual([]);
    expect(systemUnderTest.testResult()).not.toBe("27");
    expect(systemUnderTest.testResult()).toBe("");
});
