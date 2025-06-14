import { expect } from "jsr:@std/expect";
import { directiveFunction } from "../directives/directives.ts";
import { currentLine } from "../line/current-line.ts";
import { dummyLine } from "../line/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { embeddedJs } from "./embedded.ts";
import { jSExpression } from "./expression.ts";

const testSystem = () => {
    const $currentLine = currentLine();
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $directiveFunction = directiveFunction($currentLine);
    const $jsExpression = jSExpression($symbolTable, $directiveFunction);
    const $embeddedJs = embeddedJs($jsExpression);
    return {
        "embeddedJs": $embeddedJs,
        "currentLine": $currentLine
    };
};

Deno.test("A symbol assignment does not pollute the `this` context object", () => {
    const systemUnderTest = testSystem();
    const line = dummyLine(false, 1);
    line.rawSource = "{{ plop = 27; this.plop; }}";
    systemUnderTest.embeddedJs(line);
    expect(line.failed()).toBe(false);
    expect(line.assemblySource).not.toBe("27");
    expect(line.assemblySource).toBe("");
});

Deno.test("JS can be delimited with moustaches on the same line", () => {
    const systemUnderTest = testSystem();
    const line = dummyLine(false, 1);
    line.rawSource = "MOV {{ const test = 27; test; }}, R2";
    systemUnderTest.embeddedJs(line);
    expect(line.failed()).toBe(false);
    expect(line.assemblySource).toBe("MOV 27, R2");
});

Deno.test("JS can be delimited by moustaches across several lines", () => {
    const systemUnderTest = testSystem();
    const line = dummyLine(false, 1);

    line.rawSource = "some ordinary stuff {{ const test = 27;";
    systemUnderTest.embeddedJs(line);
    expect(line.failed()).toBe(false);
    expect(line.assemblySource).toBe("some ordinary stuff");

    line.rawSource = 'const message = "hello";';
    systemUnderTest.embeddedJs(line);
    expect(line.failed()).toBe(false);
    expect(line.assemblySource).toBe("");

    line.rawSource = "message; }} matey!";
    systemUnderTest.embeddedJs(line);
    expect(line.failed()).toBe(false);
    expect(line.assemblySource).toBe("hello matey!");
});

Deno.test("Multiple opening moustaches are illegal", () => {
    const systemUnderTest = testSystem();
    const line = dummyLine(false, 1);
    line.rawSource = "{{ {{ }}";
    systemUnderTest.embeddedJs(line);
    expect(line.failed()).toBe(true);
    expect(line.failures.length).toBe(1);
    expect(line.failures[0]!.kind).toBe("js_jsMode");
});

Deno.test("Multiple closing moustaches are illegal", () => {
    const systemUnderTest = testSystem();
    const line = dummyLine(false, 1);
    line.rawSource = "{{ }} }}";
    systemUnderTest.embeddedJs(line);
    expect(line.failed()).toBe(true);
    expect(line.failures.length).toBe(1);
    expect(line.failures[0]!.kind).toBe("js_assemblerMode");
});

Deno.test("Omitting a closing moustache is illegal", () => {
    const systemUnderTest = testSystem();
    const line = dummyLine(false, 1);
    line.rawSource = "{{";
    systemUnderTest.embeddedJs(line);
    expect(line.failed()).toBe(false);
    expect(line.failures.length).toBe(0);

    const lastLine = dummyLine(true, 1);
    systemUnderTest.embeddedJs(lastLine);
    expect(lastLine.failed()).toBe(true);
    expect(lastLine.failures.length).toBe(1);
    expect(lastLine.failures[0]!.kind).toBe("js_jsMode");
});
